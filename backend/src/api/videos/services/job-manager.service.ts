import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Injectable()
export class JobManagerService {


  getJobData() {
    return [
      {
        height: 1080,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY,
        processQueue: AppConfigService.appConfig.RABBIT_MQ_1080P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_1080P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_1080P_UPLOAD_VIDEO_QUEUE
      },
      {
        height: 720,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY,
        queue: AppConfigService.appConfig.RABBIT_MQ_720P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_720P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_720P_UPLOAD_VIDEO_QUEUE
      },
      {
        height: 540,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY,
        queue: AppConfigService.appConfig.RABBIT_MQ_540P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_540P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_540P_UPLOAD_VIDEO_QUEUE
      },
      {
        height: 480,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY,
        queue: AppConfigService.appConfig.RABBIT_MQ_480P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_480P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_480P_UPLOAD_VIDEO_QUEUE
      },
      {
        height: 360,
        processRoutingKey: AppConfigService.appConfig.RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY,
        queue: AppConfigService.appConfig.RABBIT_MQ_360P_PROCESS_VIDEO_QUEUE,
        uploadRoutingKey: AppConfigService.appConfig.RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY,
        uploadQueue: AppConfigService.appConfig.RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE
      }
    ];

  }


  getRenditionWiseJobDataByHeight(height: number) {
    return this.getJobData().filter(data => data.height <= height);
  }


  getJobDataByHeight(height: number) {
    return this.getJobData().find(data => data.height === height);
  }
}