import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { Constants, Utils } from 'video-touch-common';
import fs from 'fs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import mongoose from 'mongoose';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';

@Injectable()
export class CleanupService {
  constructor(private fileRepository: FileRepository, private assetRepository: AssetRepository) {}

  async cleanupDevice() {
    const activeDirectories = await this.fileRepository.findAssetIdsWithStatuses([
      Constants.FILE_STATUS.PROCESSING,
      Constants.FILE_STATUS.QUEUED,
      Constants.FILE_STATUS.FAILED,
    ]);

    let allDirectories = fs.readdirSync(AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY, { withFileTypes: true });
    let dirIds = allDirectories.map((dir) => mongoose.Types.ObjectId(dir.name));
    let assets = await this.assetRepository.find({
      _id: { $in: dirIds },
    });

    for (const dir of allDirectories) {
      let asset = assets.find((a) => a._id.toString() === dir.name);

      if (
        dir.isDirectory() &&
        !activeDirectories.includes(dir.name) &&
        asset.latest_status === Constants.VIDEO_STATUS.READY
      ) {
        let localPath = Utils.getLocalVideoRootPath(dir.name, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
        console.log('deleting local path ', localPath);
        if (fs.existsSync(localPath)) {
          fs.rmSync(localPath, { recursive: true, force: true });
        }
      }
    }
  }

  deleteLocalAssetFile(_id: string) {
    console.log('deleting local asset file ', _id);
    let localPath = Utils.getLocalVideoRootPath(_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
    console.log('local path ', localPath);
    if (fs.existsSync(localPath)) {
      fs.rmSync(localPath, { recursive: true, force: true });
    }
  }
}
