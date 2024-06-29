import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { ASSET_COLLECTION_NAME, AssetDocument } from '../schemas/assets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';

@Injectable()
export class AssetRepository extends BaseRepository<AssetDocument> {
  constructor(@InjectModel(ASSET_COLLECTION_NAME) private videoModel: Model<AssetDocument>) {
    super(videoModel);
  }

  async getPaginatedVideos(
    first: number,
    afterCursor: string,
    beforeCursor: string
  ): Promise<BasePaginatedResponse<AssetDocument>> {
    let docs: AssetDocument[];
    let filter: FilterQuery<AssetDocument> = { is_deleted: { $ne: true } };
    let sort: any = { createdAt: -1 };
    if (afterCursor) {
      filter = { ...filter, _id: { $lt: afterCursor } };
      sort = { _id: -1, ...sort };
    }
    if (beforeCursor) {
      filter = { ...filter, _id: { $gt: beforeCursor } };
      sort = { _id: 1, ...sort };
    }

    let total = await this.videoModel.countDocuments({ is_deleted: { $ne: true } });
    docs = await this.videoModel.find(filter).sort(sort).limit(first).lean();

    if (beforeCursor) {
      docs = docs.reverse();
    }

    return {
      items: docs,
      pageInfo: {
        prev_cursor: docs.length > 0 ? docs[0]._id.toString() : null,
        next_cursor: docs.length > 0 ? docs[docs.length - 1]._id.toString() : null,
        total_pages: Math.ceil(total / first),
      },
    };
  }
}
