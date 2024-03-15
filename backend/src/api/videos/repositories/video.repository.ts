import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { VIDEO_COLLECTION_NAME, VideoDocument } from '../schemas/videos.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';

@Injectable()
export class VideoRepository extends BaseRepository<VideoDocument> {
  constructor(@InjectModel(VIDEO_COLLECTION_NAME) private videoModel: Model<VideoDocument>) {
    super(videoModel);
  }

  async getPaginatedVideos(first: number, cursor: string): Promise<BasePaginatedResponse<VideoDocument>> {
    let total = await this.videoModel.countDocuments();
    let docs: VideoDocument[];
    let filter: FilterQuery<VideoDocument> = { is_deleted: { $ne: true } };
    if (cursor) {
      filter = { ...filter, _id: { $gt: cursor } };
    }
    docs = await this.videoModel.find(filter).limit(first).sort({ createdAt: -1 }).lean();

    return {
      items: docs,
      pageInfo: {
        end_cursor: docs.length > 0 ? docs[docs.length - 1]._id.toString() : null,
        total_pages: Math.ceil(total / first)
      }
    };

  }
}