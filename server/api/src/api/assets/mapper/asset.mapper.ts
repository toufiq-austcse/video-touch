import { Injectable } from '@nestjs/common';
import { Asset, CreateAssetResponse, PaginatedAssetResponse } from '@/src/api/assets/models/asset.model';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { plainToInstance } from 'class-transformer';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { StatusLogResponse } from '@/src/api/assets/models/status-logs.model';
import { CreateAssetFromUploadInputDto, CreateAssetInputDto } from '@/src/api/assets/dtos/create-asset-input.dto';
import { Constants, Utils } from '@toufiq-austcse/video-touch-common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';


@Injectable()
export class AssetMapper {
  toCreateAssetResponse(videoDocument: AssetDocument): CreateAssetResponse {
    return {
      _id: videoDocument._id.toString(),
      description: videoDocument.description,
      source_url: videoDocument.source_url,
      status: videoDocument.latest_status,
      tags: videoDocument.tags,
      title: videoDocument.title
    };
  }

  buildAssetDocumentForSaving(createVideoInput: CreateAssetInputDto): Omit<AssetDocument, '_id'> {
    let title = createVideoInput.title;
    if (!title) {
      title = this.parsedTitle(createVideoInput.source_url);
    }
    return {
      title: title,
      description: createVideoInput.description,
      source_url: createVideoInput.source_url,
      tags: createVideoInput.tags
    };
  }

  buildAssetDocumentFromUploadReq(uploadAssetReqDto: CreateAssetFromUploadInputDto): Omit<AssetDocument, '_id'> {
    let title = uploadAssetReqDto.title;
    if (!title) {
      title = this.parsedTitle(uploadAssetReqDto.file_name);
    }
    return {
      title: title,
      description: uploadAssetReqDto.description,
      source_url: null,
      tags: uploadAssetReqDto.tags
    };
  }

  private parsedTitle(source_url: string) {
    return source_url.split('/').pop().split('.').shift();
  }

  private getThumbnailCDNUrl(assetId: string) {
    return `${AppConfigService.appConfig.CDN_BASE_URL}/${Utils.getS3ThumbnailPath(assetId)}`;
  }

  toPaginatedAssetResponse(
    paginatedAssetResponse: BasePaginatedResponse<AssetDocument>,
    thumbnailFileDocuments: FileDocument[]
  ): PaginatedAssetResponse {
    let assets: Asset[] = [];
    for (let asset of paginatedAssetResponse.items) {
      let thumbnailFile = thumbnailFileDocuments.find((file) => file.asset_id.toString() === asset._id.toString());
      assets.push(this.toAssetResponse(asset, this.toStatusLogsResponse(asset.status_logs as any), thumbnailFile));
    }
    return {
      assets: assets,
      page_info: paginatedAssetResponse.pageInfo
    };
  }

  toAssetResponse(asset: AssetDocument, statusLogs: StatusLogResponse[], fileDocument: FileDocument): Asset {
    return plainToInstance(
      Asset,
      {
        title: asset.title,
        description: asset.description,
        duration: asset.duration,
        source_url: asset.source_url,
        height: asset.height,
        width: asset.width,
        thumbnail_url: fileDocument ? this.getThumbnailCDNUrl(asset._id.toString()) : null,
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
        _id: asset._id.toString()
      } as Asset,
      { excludeExtraneousValues: true, enableImplicitConversion: true }
    );
  }

  toStatusLogsResponse(statusLogs: StatusDocument[]): StatusLogResponse[] {
    let logs: StatusLogResponse[] = [];

    for (let log of statusLogs) {
      logs.push(
        plainToInstance(
          StatusLogResponse,
          {
            ...log,
            created_at: log.createdAt,
            updated_at: log.updatedAt
          } as StatusLogResponse,
          {
            excludeExtraneousValues: true,
            enableImplicitConversion: true
          }
        )
      );
    }
    return logs;
  }
}
