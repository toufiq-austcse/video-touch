import { Injectable } from '@nestjs/common';
import {
  CreateVideoResponse,
  PaginatedVideoResponse, Video,
  VideoMinimalResponse
} from '@/src/api/videos/models/videos.model';
import { VideoDocument } from '@/src/api/videos/schemas/videos.schema';
import { plainToClass, plainToInstance } from 'class-transformer';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';

@Injectable()
export class VideoMapper {
  toCreateVideoResponse(videoDocument: VideoDocument): CreateVideoResponse {
    return {
      _id: videoDocument._id.toString(),
      description: videoDocument.description,
      source_url: videoDocument.source_url,
      status: videoDocument.latest_status,
      tags: videoDocument.tags,
      title: videoDocument.title

    };

  }

  toPaginatedVideoResponse(paginatedVideoResponse: BasePaginatedResponse<VideoDocument>): PaginatedVideoResponse {
    let videos: VideoMinimalResponse[] = [];
    for (let video of paginatedVideoResponse.items) {
      videos.push(plainToClass(VideoMinimalResponse, {
        _id: video._id.toString(),
        title: video.title,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        status: video.latest_status,
        created_at: video.createdAt,
        updated_at: video.updatedAt
      } as VideoMinimalResponse, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true
      }));
    }
    return {
      videos: videos,
      page_info: paginatedVideoResponse.pageInfo
    };
  }

  toGetVideoResponse(video: VideoDocument): Video {
    return plainToInstance(Video, {
      title: video.title,
      description: video.description,
      duration: video.duration,
      source_url: video.source_url,
      height: video.height,
      width: video.width,
      thumbnail_url: video.thumbnail_url,
      size: video.size,
      master_playlist_name: video.master_playlist_name,
      status: video.latest_status,
      tags: video.tags,
      created_at: video.createdAt,
      updated_at: video.updatedAt,
      _id: video._id.toString()
    } as Video, { excludeExtraneousValues: true, enableImplicitConversion: true });
  }
}