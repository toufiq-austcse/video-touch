import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FILE_COLLECTION_NAME, FileDocument } from '@/src/api/assets/schemas/files.schema';

@Injectable()
export class FileRepository extends BaseRepository<FileDocument> {
  constructor(@InjectModel(FILE_COLLECTION_NAME) private fileDocumentModel: Model<FileDocument>) {
    super(fileDocumentModel);
  }

  async findAssetIdsWithStatuses(statuses: string[]): Promise<string[]> {
    const result = await this.fileDocumentModel.aggregate([
      {
        $match: { latest_status: { $in: statuses } },
      },
      {
        $group: {
          _id: '$asset_id',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    return result.map((item) => item._id.toString());
  }

  /**
   * Finds job IDs for files with the specified statuses
   * @param statuses Array of file statuses to match
   * @returns Array of job IDs (non-null values only)
   */
  async findFilesByStatuses(statuses: string[]): Promise<FileDocument[]> {
    return this.fileDocumentModel
      .find(
        {
          latest_status: { $in: statuses },
          job_id: { $exists: true, $ne: null },
        }
      )
      .lean();
  }
}
