import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HeightWidthMap } from '@/src/api/assets/models/file.model';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Models } from '@toufiq-austcse/video-touch-common';

@Injectable()
export class JobManagerService {
  getHeightWidthMap(): HeightWidthMap[] {
    return [
      {
        height: 1080,
        width: 1920,
      },
      {
        height: 720,
        width: 1280,
      },
      {
        height: 540,
        width: 960,
      },
      {
        height: 480,
        width: 854,
      },
      {
        height: 360,
        width: 640,
      },
    ];
  }

  getHeightWiseRoutingKey(height: number) {
    switch (height) {
      case 1080:
        return AppConfigService.appConfig.RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY;
      case 720:
        return AppConfigService.appConfig.RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY;
      case 540:
        return AppConfigService.appConfig.RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY;
      case 480:
        return AppConfigService.appConfig.RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY;
      case 360:
        return AppConfigService.appConfig.RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY;
      default:
        return null;
    }
  }

  getJobData(assetId: string, files: FileDocument[]): Models.JobMetadataModel[] {
    let jobModels: Models.JobMetadataModel[] = [];
    for (let file of files) {
      jobModels.push({
        asset_id: assetId,
        file_id: file._id.toString(),
        height: file.height,
        width: file.width,
        processRoutingKey: this.getHeightWiseRoutingKey(file.height),
      });
    }
    return jobModels;
  }

  getAllHeightWidthMapByHeight(height: number) {
    return this.getHeightWidthMap().filter((data) => data.height <= height);
  }

  getJobDataByHeight(height: number) {
    return this.getHeightWidthMap().find((data) => data.height === height);
  }
}
