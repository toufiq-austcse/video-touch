import { FileDocument } from '@/src/api/videos/schemas/files.schema';
import { StatusMapper } from '@/src/api/videos/mapper/status.mapper';
import { getFileName } from '@/src/common/utils';
import mongoose from 'mongoose';

export class FileMapper {
  static mapForSave(
    asset_id: string,
    type: string,
    height: number,
    width: number,
    status: string,
    status_details: string
  ): Omit<FileDocument, '_id'> {
    return {
      asset_id: mongoose.Types.ObjectId(asset_id),
      height: height,
      width: width,
      latest_status: status,
      name: getFileName(height),
      size: 0,
      status_logs: [StatusMapper.mapForSave(status, status_details)],
      type: type

    };

  }
}