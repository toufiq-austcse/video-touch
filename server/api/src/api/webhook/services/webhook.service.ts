import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AssetDocument } from '../../assets/schemas/assets.schema';
import { WebhookPayloadDto } from '../dto/webhook-payload.dto';

@Injectable()
export class WebhookService {
  constructor(private readonly httpService: HttpService) {}

  async publishEvent(updatedAsset: AssetDocument): Promise<any> {
    try {
      let payload: WebhookPayloadDto = {
        asset_id: updatedAsset._id.toString(),
        created_at: updatedAsset.createdAt.getTime(),
        status: updatedAsset.latest_status,
      };
      let res = await firstValueFrom(
        this.httpService.post(`${AppConfigService.appConfig.WEBHOOK_URL}`, payload, {
          headers: {
            'x-gumlet-token': AppConfigService.appConfig.WEBHOOK_TOKEN,
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
