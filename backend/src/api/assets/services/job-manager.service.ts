import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { JobMetadataModel } from '@/src/api/assets/models/job.model';

@Injectable()
export class JobManagerService {
  getJobData(): JobMetadataModel[] {
    return [
      {
        height: 1080,
        width: 1920,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_1080P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_1080P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_1080P_UPLOAD_VIDEO_QUEUE,
      },
      {
        height: 720,
        width: 1280,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_720P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_720P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_720P_UPLOAD_VIDEO_QUEUE,
      },
      {
        height: 540,
        width: 960,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_540P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_540P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_540P_UPLOAD_VIDEO_QUEUE,
      },
      {
        height: 480,
        width: 854,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_480P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_480P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_480P_UPLOAD_VIDEO_QUEUE,
      },
      {
        height: 360,
        width: 640,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_360P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE,
      },
    ];
  }

  getRenditionWiseJobDataByHeight(height: number) {
    return this.getJobData().filter((data) => data.height <= height);
  }

  getJobDataByHeight(height: number) {
    return this.getJobData().find((data) => data.height === height);
  }
}