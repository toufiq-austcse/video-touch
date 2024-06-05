import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { FILE_STATUS } from '@/src/common/constants';
import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';
import { VideoProcessingJobModel, VideoUploadJobModel } from '@/src/worker/models/job.model';
import { UpdateFileStatusEventModel } from '@/src/worker/models/event.model';

@Injectable()
export class ProcessVideoWorker {
  constructor(
    private transcodingService: TranscodingService,
    private rabbitMqService: RabbitMqService,
    private manifestService: ManifestService
  ) {
  }

  async processVideo(msg: VideoProcessingJobModel, height: number, width: number) {
    try {
      this.publishUpdateFileStatusEvent(msg._id.toString(), 'Video transcoding started', 0, FILE_STATUS.PROCESSING, height);
      let res = await this.transcodingService.transcodeVideoByResolution(msg._id.toString(), height, width);
      console.log(`video ${height}p transcode:`, res);
      this.manifestService.appendManifest(msg._id.toString(), height);

      this.publishVideoUploadJob(msg._id.toString(), height, width);

    } catch (e: any) {
      console.log(`error while processing ${height}p`, e);

      this.publishUpdateFileStatusEvent(msg._id.toString(), e.message, 0, FILE_STATUS.FAILED, height);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_PROCESS_VIDEO_QUEUE
  })
  public async handle(msg: VideoProcessingJobModel) {
    console.log('VideoProcessingJobHandler', msg);

    let { height, width } = msg;
    await this.processVideo(msg, height, width);
  }


  publishVideoUploadJob(_id: string, height: number, width: number) {
    let jobModel: VideoUploadJobModel = {
      _id: _id,
      height: height,
      width: width
    };

    return this.rabbitMqService.publish(
      AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
      AppConfigService.appConfig.RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY,
      jobModel
    );
  }

  publishUpdateFileStatusEvent(assetId: string, details: string, dirSize: number, status: string, height: number) {
    try {
      let updateFileStatusEvent = this.buildUpdateFileStatusEventModel(assetId, details, dirSize, status, height);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        updateFileStatusEvent
      );
    } catch (e) {
      console.log('error while publishing update file status event', e);
    }

  }

  buildUpdateFileStatusEventModel(assetId: string, details: string, dirSize: number, status: string, height: number): UpdateFileStatusEventModel {
    return {
      asset_id: assetId, details: details, dir_size: dirSize, height: height, status: status
    };
  }
}
