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

  async getPaginatedVideos(first: number, afterCursor: string, beforeCursor: string): Promise<BasePaginatedResponse<VideoDocument>> {
    let docs: VideoDocument[];
    let filter: FilterQuery<VideoDocument> = { is_deleted: { $ne: true } };
    let sort: any = { createdAt: -1 };
    if (afterCursor) {
      filter = { ...filter, _id: { $lt: afterCursor } };
      sort = { _id: -1, ...sort };
    }
    if (beforeCursor) {
      filter = { ...filter, _id: { $gt: beforeCursor } };
      sort = { _id: 1, ...sort };
    }
    console.log(filter);

    let total = await this.videoModel.countDocuments({ is_deleted: { $ne: true } });
    docs = await this.videoModel.find(filter).sort(sort).limit(first).lean();

    if(beforeCursor){
      docs = docs.reverse();
    }

    return {
      items: docs,
      pageInfo: {
        prev_cursor: docs.length > 0 ? docs[0]._id.toString() : null,
        next_cursor: docs.length > 0 ? docs[docs.length - 1]._id.toString() : null,
        total_pages: Math.ceil(total / first)
      }
    };
  }
}
