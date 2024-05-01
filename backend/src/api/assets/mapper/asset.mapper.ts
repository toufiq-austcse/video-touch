import { Injectable } from '@nestjs/common';
import {
  Asset,
  AssetMinimalResponse,
  CreateAssetResponse,
  PaginatedAssetResponse,
} from '@/src/api/assets/models/asset.model';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { plainToClass, plainToInstance } from 'class-transformer';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { StatusDocument } from '@/src/api/assets/schemas/status.schema';
import { StatusLogResponse } from '@/src/api/assets/models/status-logs.model';
import { getMasterPlaylistUrl } from '@/src/common/utils';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class AssetMapper {
  toCreateAssetResponse(videoDocument: AssetDocument): CreateAssetResponse {
    return {
      _id: videoDocument._id.toString(),
      description: videoDocument.description,
      source_url: videoDocument.source_url,
      status: videoDocument.latest_status,
      tags: videoDocument.tags,
      title: videoDocument.title,
    };
  }

  toPaginatedAssetResponse(paginatedVideoResponse: BasePaginatedResponse<AssetDocument>): PaginatedAssetResponse {
    let videos: AssetMinimalResponse[] = [];
    for (let video of paginatedVideoResponse.items) {
      videos.push(
        plainToClass(
          AssetMinimalResponse,
          {
            _id: video._id.toString(),
            title: video.title,
            thumbnail_url: null,
            duration: video.duration,
            status: video.latest_status,
            created_at: video.createdAt,
            updated_at: video.updatedAt,
          } as AssetMinimalResponse,
          {
            excludeExtraneousValues: true,
            enableImplicitConversion: true,
          }
        )
      );
    }
    return {
      assets: videos,
      page_info: paginatedVideoResponse.pageInfo,
    };
  }

  toGetAssetResponse(asset: AssetDocument, statusLogs: StatusLogResponse[]): Asset {
    return plainToInstance(
      Asset,
      {
        title: asset.title,
        description: asset.description,
        duration: asset.duration,
        source_url: asset.source_url,
        height: asset.height,
        width: asset.width,
        thumbnail_url: null,
        size: asset.size,
        master_playlist_url:
          asset.latest_status === VIDEO_STATUS.READY ? getMasterPlaylistUrl(asset._id.toString()) : null,
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

  toStatusLogsResponse(statusLogs: StatusDocument[]): StatusLogResponse[] {
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
    console.log(logs);
    return logs;
  }
}
