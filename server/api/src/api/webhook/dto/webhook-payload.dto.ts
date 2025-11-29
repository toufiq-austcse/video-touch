export class WebhookPayloadDto {
  event_type: string;
  data: AssetUpdatePayloadDto | FileUpdatePayloadDto;
}

export class AssetUpdatePayloadDto {
  asset_id: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export class FileUpdatePayloadDto {
  asset_id: string;
  file_id: string;
  status: string;
  name: string;
  size: number;
  type: string;
  file_url: string;
  created_at: number;
  updated_at: number;
}
