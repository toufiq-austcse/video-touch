import { FileDocument } from '../schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import { Utils } from '@toufiq-austcse/video-touch-common';
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
      name: Utils.getFileName(height),
      size: 0,
      status_logs: [StatusMapper.mapForSave(status, status_details)],
      type: type
    };
  }
}
