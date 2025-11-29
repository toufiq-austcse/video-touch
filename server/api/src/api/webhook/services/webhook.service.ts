import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AssetDocument } from '../../assets/schemas/assets.schema';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Utils } from 'video-touch-common';

@Injectable()
export class WebhookService {
  constructor(private readonly httpService: HttpService) {}

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
