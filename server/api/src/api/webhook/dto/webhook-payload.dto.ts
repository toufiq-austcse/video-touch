import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class WebhookPayloadDto {
  @ApiPropertyOptional()
  @IsOptional()
  asset_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  created_at: number;

  @ApiPropertyOptional()
  @IsOptional()
  status: string;
}
