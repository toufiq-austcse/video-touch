import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';
import { Models, Constants } from '@toufiq-austcse/video-touch-common';


@Injectable()
export class ProcessVideoWorker {
  constructor(
    private transcodingService: TranscodingService,
    private rabbitMqService: RabbitMqService,
    private manifestService: ManifestService
  ) {
  }

  async processVideo(msg: Models.VideoProcessingJobModel, height: number, width: number) {
    try {
      this.publishUpdateFileStatusEvent(msg.file_id.toString(), 'Video transcoding started', 0, Constants.FILE_STATUS.PROCESSING);
      let res = await this.transcodingService.transcodeVideoByResolution(msg.asset_id.toString(), height, width);
      console.log(`video ${height}p transcode:`, res);
      this.manifestService.appendManifest(msg.asset_id.toString(), height);

      this.publishVideoUploadJob(msg.file_id.toString(), msg.asset_id, height, width);

    } catch (e: any) {
      console.log(`error while processing ${height}p`, e);

      this.publishUpdateFileStatusEvent(msg.file_id.toString(), e.message, 0, Constants.FILE_STATUS.FAILED);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_PROCESS_VIDEO_QUEUE
  })
  public async handle(msg: Models.VideoProcessingJobModel) {
    console.log('VideoProcessingJobHandler', msg);

    let { height, width } = msg;
    await this.processVideo(msg, height, width);
  }


  publishVideoUploadJob(fileId: string, assetId: string, height: number, width: number) {
    let jobModel: Models.VideoUploadJobModel = {
      asset_id: assetId,
      file_id: fileId,
      height: height,
      width: width
    };

    return this.rabbitMqService.publish(
      AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
      AppConfigService.appConfig.RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY,
      jobModel
    );
  }

  publishUpdateFileStatusEvent(fileId: string, details: string, dirSize: number, status: string) {
    try {
      let updateFileStatusEvent = this.buildUpdateFileStatusEventModel(fileId, details, dirSize, status);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        updateFileStatusEvent
      );
    } catch (e) {
      console.log('error while publishing update file status event', e);
    }

  }

  buildUpdateFileStatusEventModel(fileId: string, details: string, dirSize: number, status: string): Models.UpdateFileStatusEventModel {
    return {
      file_id: fileId, details: details, dir_size: dirSize, status: status
    };
  }
}
