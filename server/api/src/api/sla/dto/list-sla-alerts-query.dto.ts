import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsMongoId, IsOptional } from 'class-validator';

export class ListSlaAlertsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  asset_id?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date; alerts created at or after it' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date; alerts created at or before it' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
