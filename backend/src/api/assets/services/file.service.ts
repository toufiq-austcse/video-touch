import { Injectable } from '@nestjs/common';
import { JobMetadataModel, VideoValidationJobModel } from '@/src/api/assets/models/job.model';
import { FileMapper } from '@/src/api/assets/mapper/file.mapper';
import { FILE_STATUS } from '@/src/common/constants';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import mongoose from 'mongoose';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';

@Injectable()
export class FileService {
  constructor(private repository: FileRepository) {
  }

  async createFileAfterValidation(msg: VideoValidationJobModel, jobData: JobMetadataModel) {
    let doc = FileMapper.mapForSave(msg._id, 'playlist', jobData.height, jobData.width, FILE_STATUS.QUEUED, 'File queued for processing');
    return this.repository.create(doc);

  }

  async updateFileStatus(assetId: string, height: number, status: string, details: string, size?: number) {
    let updatedData: mongoose.UpdateQuery<FileDocument> = {
      latest_status: status,
      $push: {
        status_logs: {
          status: status,
          details: details
        }
      }
    };
    if (size) {
      updatedData = {
        ...updatedData,
        size: size
      };
    }
    console.log('assetId', assetId, 'height ', height, 'updatedData', updatedData);

    return this.repository.findOneAndUpdate({
      asset_id: mongoose.Types.ObjectId(assetId),
      height: height
    }, updatedData);
  }

}