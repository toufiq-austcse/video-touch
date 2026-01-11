import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WEBHOOK_COLLECTION_NAME, WebHookDocument } from '@/src/api/webhook/schemas/webhook.schema';
import { BasePaginatedResponse } from '@/src/common/database/models/abstract.model';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import mongoose from 'mongoose';

@Injectable()
export class WebhookRepository extends BaseRepository<WebHookDocument> {
  constructor(@InjectModel(WEBHOOK_COLLECTION_NAME) private webHookDocumentModel: Model<WebHookDocument>) {
    super(webHookDocumentModel);
  }

  async getPaginatedWebhooks(
    first: number,
    afterCursor: string,
    beforeCursor: string,
    search: string,
    user: UserDocument
  ): Promise<BasePaginatedResponse<WebHookDocument>> {
    // Build the base match stage with user filter
    const baseMatch: any = {
      user_id: user._id,
    };

    // Add search functionality for URL
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive partial match
      baseMatch.url = searchRegex;
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
    const [result] = await this.webHookDocumentModel.aggregate(pipeline);

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
