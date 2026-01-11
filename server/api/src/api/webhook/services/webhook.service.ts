import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AssetDocument } from '../../assets/schemas/assets.schema';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Utils, Constants } from 'video-touch-common';
import { WebHookDocument } from '@/src/api/webhook/schemas/webhook.schema';
import { CreateWebhookInputDto } from '@/src/api/webhook/dto/create-webhook-input.dto';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { WebhookMapper } from '@/src/api/webhook/mapper/webhook.mapper';
import { WebhookRepository } from '@/src/api/webhook/repositories/webhook.repository';
import { ListWebhookInputDto } from '@/src/api/webhook/dto/list-webhook-input.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly httpService: HttpService, private repistory: WebhookRepository) {}

  async create(input: CreateWebhookInputDto, user: UserDocument): Promise<WebHookDocument> {
    let webhookDocument = WebhookMapper.buildWebhookDocumentForSaving(input, user);
    return this.repistory.create(webhookDocument);
  }

  async listWebhooks(listWebhookInputDto: ListWebhookInputDto, user: UserDocument) {
    return this.repistory.getPaginatedWebhooks(
      listWebhookInputDto.first,
      listWebhookInputDto.after,
      listWebhookInputDto.before,
      listWebhookInputDto.search,
      user
    );
  }

  async publishAssetEvent(updatedAsset: AssetDocument): Promise<any> {
    try {
      let payload: WebhookPayloadDto = {
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
      return res;
    } catch (err) {
      console.log('error in webhook publishEvent ', err);
      throw new Error('error in publish webhook event');
    }
  }
  async publishFileEvent(updatedFile: FileDocument): Promise<any> {
    try {
      if (updatedFile.type === Constants.FILE_TYPE.PARTIAL_TRANSCRIPT) {
        console.log('skipping webhook for partial transcript file ', updatedFile._id.toString());
        return;
      }
      let payload: WebhookPayloadDto = {
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
          file_url: `${AppConfigService.appConfig.CDN_BASE_URL}/${Utils.getS3TranscriptFilePath(
            updatedFile.asset_id.toString(),
            updatedFile.name
          )}`,
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
      return res;
    } catch (err) {
      console.log('error in webhook publishEvent ', err);
      throw new Error('error in publish webhook event');
    }
  }
}
