import { Asset, PaginatedAssetResponse } from '@/src/api/assets/models/asset.model';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { plainToInstance } from 'class-transformer';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { StatusLogResponse } from '@/src/api/assets/models/status-logs.model';
import { CreateAssetFromUploadInputDto, CreateAssetInputDto } from '@/src/api/assets/dtos/create-asset-input.dto';
import { Constants, Utils } from '@toufiq-austcse/video-touch-common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

export class AssetMapper {
  static buildAssetDocumentForSaving(createVideoInput: CreateAssetInputDto): Omit<AssetDocument, '_id'> {
    let title = createVideoInput.title;
    if (!title) {
      title = this.parsedTitle(createVideoInput.source_url);
    }
    return {
      title: title,
      description: createVideoInput.description,
      source_url: createVideoInput.source_url,
      tags: createVideoInput.tags,
    };
  }

  static buildAssetDocumentFromUploadReq(uploadAssetReqDto: CreateAssetFromUploadInputDto): Omit<AssetDocument, '_id'> {
    let title = uploadAssetReqDto.title;
    if (!title) {
      title = this.parsedTitle(uploadAssetReqDto.file_name);
    }
    return {
      title: title,
      description: uploadAssetReqDto.description,
      source_url: null,
      tags: uploadAssetReqDto.tags,
    };
  }

  static parsedTitle(source_url: string) {
    return source_url.split('/').pop().split('.').shift();
  }

  static toPaginatedAssetResponse(
    paginatedAssetResponse: BasePaginatedResponse<AssetDocument>
  ): PaginatedAssetResponse {
    let assets: Asset[] = [];
    for (let asset of paginatedAssetResponse.items) {
      assets.push(this.toAssetResponse(asset, this.toStatusLogsResponse(asset.status_logs as any)));
    }
    return {
      assets: assets,
      page_info: paginatedAssetResponse.pageInfo,
    };
  }

  static toAssetResponse(asset: AssetDocument, statusLogs: StatusLogResponse[]): Asset {
    return plainToInstance(
      Asset,
      {
        title: asset.title,
        description: asset.description,
        duration: asset.duration,
        source_url: asset.source_url,
        height: asset.height,
        width: asset.width,
        size: asset.size,
        master_playlist_url:
          asset.latest_status === Constants.VIDEO_STATUS.READY
            ? Utils.getMasterPlaylistUrl(asset._id.toString(), AppConfigService.appConfig.CDN_BASE_URL)
            : null,
        latest_status: asset.latest_status,
        status_logs: statusLogs,
        tags: asset.tags,
        created_at: asset.createdAt,
        updated_at: asset.updatedAt,
        _id: asset._id.toString(),
      } as Asset,
      { excludeExtraneousValues: true, enableImplicitConversion: true }
    );
  }

  static toStatusLogsResponse(statusLogs: StatusDocument[]): StatusLogResponse[] {
    let logs: StatusLogResponse[] = [];

    for (let log of statusLogs) {
      logs.push(
        plainToInstance(
          StatusLogResponse,
          {
            ...log,
            created_at: log.createdAt,
            updated_at: log.updatedAt,
          } as StatusLogResponse,
          {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          }
        )
      );
    }
    return logs;
  }
}
