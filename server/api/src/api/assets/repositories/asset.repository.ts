import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { ASSET_COLLECTION_NAME, AssetDocument } from '../schemas/assets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import mongoose from 'mongoose';

@Injectable()
export class AssetRepository extends BaseRepository<AssetDocument> {
  constructor(@InjectModel(ASSET_COLLECTION_NAME) private videoModel: Model<AssetDocument>) {
    super(videoModel);
  }

  async updateMany(filter: FilterQuery<AssetDocument>, update: UpdateQuery<AssetDocument>): Promise<any> {
    return this.videoModel.updateMany(filter, update);
  }

  async getPaginatedVideos(
    first: number,
    afterCursor: string,
    beforeCursor: string,
    search: string,
    user: UserDocument
  ): Promise<BasePaginatedResponse<AssetDocument>> {
    // Build the base match stage with user and soft-delete filters
    const baseMatch: any = {
      user_id: user._id,
      is_deleted: { $ne: true },
    };

    // Add search functionality for both _id and title
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive partial match

      // Check if search looks like a valid ObjectId (24 hex characters)
      const isValidObjectId = /^[a-f\d]{24}$/i.test(search.trim());

      if (isValidObjectId) {
        // If it's a valid ObjectId, search by exact _id match OR title partial match
        baseMatch.$or = [{ _id: mongoose.Types.ObjectId(search.trim()) }, { title: searchRegex }];
      } else {
        // If it's not an ObjectId, search by title partial match only
        baseMatch.title = searchRegex;
      }
    }

    // Build the aggregation pipeline
    const pipeline: any[] = [{ $match: baseMatch }];

    // Add cursor-based filtering
    if (afterCursor) {
      pipeline.push({
        $match: { _id: { $lt: mongoose.Types.ObjectId(afterCursor) } },
      });
    }

    if (beforeCursor) {
      pipeline.push({
        $match: { _id: { $gt: mongoose.Types.ObjectId(beforeCursor) } },
      });
    }

    // Use facet to get both paginated results and total count in one query
    pipeline.push({
      $facet: {
        items: [{ $sort: { createdAt: -1, _id: -1 } }, { $limit: first }],
        totalCount: [{ $count: 'count' }],
      },
    });

    // Execute the aggregation
    const [result] = await this.videoModel.aggregate(pipeline);

    let items = result?.items || [];
    const total = result?.totalCount?.[0]?.count || 0;

    // Reverse items if using beforeCursor for proper pagination
    if (beforeCursor) {
      items = items.reverse();
    }

    return {
      items,
      pageInfo: {
        prev_cursor: items.length > 0 ? items[0]._id.toString() : null,
        next_cursor: items.length > 0 ? items[items.length - 1]._id.toString() : null,
        total_pages: Math.ceil(total / first),
      },
    };
  }
}
