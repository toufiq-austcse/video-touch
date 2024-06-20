import { FileDocument } from '../schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import mongoose from 'mongoose';

export class FileMapper {
  static mapForSave(
    asset_id: string,
    name: string,
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
      name: name,
      size: 0,
      status_logs: [StatusMapper.mapForSave(status, status_details)],
      type: type
    };
  }
}
