import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Injectable } from '@nestjs/common';
import { AssetDocument } from '../../assets/schemas/assets.schema';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Constants } from 'video-touch-common';
import { WebHookDocument } from '@/src/api/webhook/schemas/webhook.schema';
import { CreateWebhookInputDto } from '@/src/api/webhook/dto/create-webhook-input.dto';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { WebhookMapper } from '@/src/api/webhook/mapper/webhook.mapper';
import { WebhookRepository } from '@/src/api/webhook/repositories/webhook.repository';
import { ListWebhookInputDto } from '@/src/api/webhook/dto/list-webhook-input.dto';
import { UpdateWebhookInputDto } from '@/src/api/webhook/dto/update-webhook-input.dto';
import mongoose from 'mongoose';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { WebhookNotifyConsumerDto } from '@/src/api/webhook/dto/webhook-notify-consumer.dto';
import { WEBHOOK_IDENTIFICATION_TYPES } from '@/src/common/constants';

@Injectable()
export class WebhookService {
  constructor(private webhookRepository: WebhookRepository, private rabbitMqService: RabbitMqService) {}

  async create(input: CreateWebhookInputDto, user: UserDocument): Promise<WebHookDocument> {
    let webhookDocument = WebhookMapper.buildWebhookDocumentForSaving(input, user);
    return this.webhookRepository.create(webhookDocument);
  }

  async listWebhooks(listWebhookInputDto: ListWebhookInputDto, user: UserDocument) {
    return this.webhookRepository.getPaginatedWebhooks(
      listWebhookInputDto.first,
      listWebhookInputDto.after,
      listWebhookInputDto.before,
      listWebhookInputDto.search,
      user
    );
  }

  async update(oldWebhook: WebHookDocument, updateWebhookInput: UpdateWebhookInputDto) {
    await this.webhookRepository.findOneAndUpdate(
      { _id: oldWebhook._id },
      {
        url: updateWebhookInput.url ? updateWebhookInput.url : oldWebhook.url,
        secret_token:
          updateWebhookInput.secret_token !== undefined ? updateWebhookInput.secret_token : oldWebhook.secret_token,
      }
    );
    return this.webhookRepository.findOne({ _id: oldWebhook._id });
  }

  async getWebhook(_id: string, user: UserDocument) {
    return this.webhookRepository.findOne({
      _id: _id,
      user_id: user._id,
    });
  }

  async delete(webhook: WebHookDocument) {
    await this.webhookRepository.deleteOne({ _id: webhook._id });
  }

  async publishAssetEvent(updatedAsset: AssetDocument): Promise<any> {
    let payload: WebhookPayloadDto;
    try {
      let webhooks = await this.webhookRepository.find({
        user_id: updatedAsset.user_id,
      });

      payload = {
        event_type: `asset.status.${updatedAsset.latest_status.toLowerCase()}`,
        data: {
          asset_id: updatedAsset._id.toString(),
          created_at: updatedAsset.createdAt.toISOString(),
          updated_at: updatedAsset.updatedAt.toISOString(),
          status: updatedAsset.latest_status,
        },
      };

      for (let webhook of webhooks) {
        this.rabbitMqService.publish(
          AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
          AppConfigService.appConfig.RABBIT_MQ_WEBHOOK_NOTIFY_ROUTING_KEY,
          {
            url: webhook.url,
            auth_token: webhook.secret_token,
            user_id: updatedAsset.user_id.toString(),
            asset_id: updatedAsset._id.toString(),
            webhook_id: webhook._id.toString(),
            payload: payload,
            identification_type: WEBHOOK_IDENTIFICATION_TYPES.ASSET,
            identification_value: updatedAsset._id.toString(),
          } as WebhookNotifyConsumerDto
        );
      }
    } catch (err: unknown) {
      console.log('error in webhook publishEvent ', err);

      throw new Error('error in publish webhook event');
    }
  }
  async publishFileEvent(updatedFile: FileDocument, userId: mongoose.Types.ObjectId, cdnFileUrl: string): Promise<any> {
    let payload: WebhookPayloadDto;

    try {
      if (updatedFile.type === Constants.FILE_TYPE.PARTIAL_TRANSCRIPT) {
        console.log('skipping webhook for partial transcript file ', updatedFile._id.toString());
        return;
      }

      let webhooks = await this.webhookRepository.find({
        user_id: userId,
      });

      payload = {
        event_type: `file.status.${updatedFile.latest_status.toLowerCase()}`,
        data: {
          file_id: updatedFile._id.toString(),
          asset_id: updatedFile.asset_id.toString(),
          name: updatedFile.name,
          status: updatedFile.latest_status,
          created_at: updatedFile.createdAt.toISOString(),
          updated_at: updatedFile.updatedAt.toISOString(),
          size: updatedFile.size,
          type: updatedFile.type,
          file_url: cdnFileUrl,
        },
      };
      for (let webhook of webhooks) {
        this.rabbitMqService.publish(
          AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
          AppConfigService.appConfig.RABBIT_MQ_WEBHOOK_NOTIFY_ROUTING_KEY,
          {
            url: webhook.url,
            auth_token: webhook.secret_token,
            user_id: userId.toString(),
            asset_id: updatedFile.asset_id.toString(),
            payload: payload,
            webhook_id: webhook._id.toString(),
            identification_type: WEBHOOK_IDENTIFICATION_TYPES.FILE,
            identification_value: updatedFile._id.toString(),
          } as WebhookNotifyConsumerDto
        );
      }
    } catch (err) {
      console.log('error in webhook publishEvent ', err);
      throw new Error('error in publish webhook event');
    }
  }
}
