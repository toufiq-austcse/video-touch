import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
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
import { WEBHOOOK_RESPONSE_STATUS } from '@/src/common/constants';
import { WebhookResponseService } from '@/src/api/webhook/services/webhook-response.service';
import mongoose from 'mongoose';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private webhookRepository: WebhookRepository,
    private webhookResponseService: WebhookResponseService
  ) {}

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
      payload = {
        event_type: `asset.status.${updatedAsset.latest_status.toLowerCase()}`,
        data: {
          asset_id: updatedAsset._id.toString(),
          created_at: updatedAsset.createdAt.toISOString(),
          updated_at: updatedAsset.updatedAt.toISOString(),
          status: updatedAsset.latest_status,
        },
      };
      console.log('publishing asset webhook event ', payload);
      let res = await firstValueFrom(
        this.httpService.post(`${AppConfigService.appConfig.WEBHOOK_URL}`, payload, {
          headers: {
            'x-gumlet-token': AppConfigService.appConfig.WEBHOOK_TOKEN,
            'x-tenms-service-key': AppConfigService.appConfig.WEBHOOK_TOKEN,
          },
        })
      );
      await this.webhookResponseService.createAssetWebhookResponse(
        updatedAsset,
        WEBHOOOK_RESPONSE_STATUS.SUCCESS,
        payload,
        res.data as any
      );
      return res;
    } catch (err: unknown) {
      console.log('error in webhook publishEvent ', err);
      await this.webhookResponseService.createAssetWebhookResponse(
        updatedAsset,
        WEBHOOOK_RESPONSE_STATUS.FAILED,
        payload,
        null,
        err
      );
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
      console.log('publishFileEvent payload ', payload);
      let res = await firstValueFrom(
        this.httpService.post(`${AppConfigService.appConfig.WEBHOOK_URL}`, payload, {
          headers: {
            'x-gumlet-token': AppConfigService.appConfig.WEBHOOK_TOKEN,
            'x-tenms-service-key': AppConfigService.appConfig.WEBHOOK_TOKEN,
          },
        })
      );

      await this.webhookResponseService.createFileWebhookResponse(
        updatedFile,
        WEBHOOOK_RESPONSE_STATUS.SUCCESS,
        userId,
        payload,
        res.data as any
      );
      return res;
    } catch (err) {
      console.log('error in webhook publishEvent ', err);
      await this.webhookResponseService.createFileWebhookResponse(
        updatedFile,
        WEBHOOOK_RESPONSE_STATUS.FAILED,
        userId,
        payload,
        null,
        err
      );
      throw new Error('error in publish webhook event');
    }
  }
}
