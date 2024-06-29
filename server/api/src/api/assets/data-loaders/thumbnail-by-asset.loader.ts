import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FILE_STATUS, FILE_TYPE } from '@toufiq-austcse/video-touch-common/dist/constants';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import mongoose from 'mongoose';
import { FileMapper } from '@/src/api/assets/mapper/file.mapper';

@Injectable({ scope: Scope.REQUEST })
export class thumbnailByAssetLoader extends DataLoader<string, string> {
  constructor(private fileRepository: FileRepository) {
    super((keys) => this.batchLoadFn(keys));
  }

  private async batchLoadFn(assetIds: readonly string[]): Promise<string[]> {
    let assetIdsInObjectIds = assetIds.map((assetId) => mongoose.Types.ObjectId(assetId));
    let thumbnailUrls = [];
    let thumbnailsFiles = await this.fileRepository.find({
      asset_id: { $in: assetIdsInObjectIds },
      type: FILE_TYPE.THUMBNAIL,
      latest_status: FILE_STATUS.READY,
    });

    for (let assetId of assetIds) {
      let thumbnailFile = thumbnailsFiles.find((file) => file.asset_id.toString() === assetId);
      thumbnailUrls.push(
        thumbnailFile ? FileMapper.getThumbnailCDNUrl(assetId) : AppConfigService.appConfig.DEFAULT_THUMBNAIL_URL
      );
    }

    return thumbnailUrls;
  }
}
