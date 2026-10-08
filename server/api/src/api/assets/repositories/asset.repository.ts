import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { ASSET_COLLECTION_NAME, AssetDocument } from '../schemas/assets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import mongoose from 'mongoose';
import { Constants } from 'video-touch-common';

@Injectable()
export class AssetRepository extends BaseRepository<AssetDocument> {
  constructor(@InjectModel(ASSET_COLLECTION_NAME) private videoModel: Model<AssetDocument>) {
    super(videoModel);
  }

  async updateMany(filter: FilterQuery<AssetDocument>, update: UpdateQuery<AssetDocument>): Promise<any> {
    return this.videoModel.updateMany(filter, update);
  }

  /** Starts the SLA clock only if it isn't already running. updateOne: does not fire the asset post-hook. */
  async startSlaClock(assetId: string, at: Date) {
    return this.videoModel.updateOne(
      { _id: mongoose.Types.ObjectId(assetId), 'sla.started_at': { $exists: false } },
      { $set: { 'sla.started_at': at } }
    );
  }

  async findSlaWarningCandidates(cutoff: Date, lookback: Date, limit: number): Promise<AssetDocument[]> {
    return this.videoModel
      .find(
        {
          is_deleted: { $ne: true },
          'sla.started_at': { $lte: cutoff, $gte: lookback },
          latest_status: { $ne: Constants.VIDEO_STATUS.READY },
          'sla.warning_alerted_at': { $exists: false },
        },
        { _id: 1, user_id: 1, title: 1, latest_status: 1, sla: 1 }
      )
      .sort({ 'sla.started_at': 1 })
      .limit(limit)
      .lean();
  }

  /** Atomic claim. Returns true only for the caller that set the flag. */
  async claimSlaWarning(assetId: mongoose.Types.ObjectId, at: Date): Promise<boolean> {
    const res = await this.videoModel.updateOne(
      {
        _id: assetId,
        'sla.warning_alerted_at': { $exists: false },
        latest_status: { $ne: Constants.VIDEO_STATUS.READY },
      },
      { $set: { 'sla.warning_alerted_at': at } }
    );
    return res.nModified === 1; // Mongoose 5 result shape
  }

  async releaseSlaWarning(assetIds: mongoose.Types.ObjectId[]) {
    return this.videoModel.updateMany({ _id: { $in: assetIds } }, { $unset: { 'sla.warning_alerted_at': '' } });
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
