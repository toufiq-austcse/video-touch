import { WebhookPayloadDto } from '@/src/api/webhook/dto/webhook-payload.dto';

export interface WebhookNotifyConsumerDto {
  user_id: string;
  asset_id: string;
  url: string;
  auth_token: string;
  identification_type: string;
  identification_value: string;
  payload: WebhookPayloadDto;
  webhook_id: string;
}
