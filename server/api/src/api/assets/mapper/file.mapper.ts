import { FileDocument } from '../schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import mongoose from 'mongoose';
import { File } from '@/src/api/assets/models/file.model';
import { plainToInstance } from 'class-transformer';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Utils } from 'video-touch-common';

export class FileMapper {
  static mapForSave(
    asset_id: string,
    name: string,
    type: string,
    height: number,
    width: number,
    status: string,
    status_details: string,
    size: number = 0
  ): Omit<FileDocument, '_id'> {
    return {
      asset_id: mongoose.Types.ObjectId(asset_id),
      height: height,
      width: width,
      latest_status: status,
      name: name,
      size: size,
      status_logs: [StatusMapper.mapForSave(status, status_details)],
      type: type,
    };
  }

  static toFileResponse(file: FileDocument): File {
    return plainToInstance(
      File,
      {
        _id: file._id.toString(),
        height: file.height,
        width: file.width,
        latest_status: file.latest_status,
        name: file.name,
        size: file.size,
        type: file.type,
        created_at: file.createdAt,
        updated_at: file.updatedAt,
      } as File,
      {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }
    );
  }

  static getThumbnailCDNUrl(assetId: string) {
    return `${AppConfigService.appConfig.CDN_BASE_URL}/${Utils.getS3ThumbnailPath(assetId)}`;
  }
}
