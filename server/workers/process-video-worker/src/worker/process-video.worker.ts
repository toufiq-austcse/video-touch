import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { FILE_STATUS, VIDEO_STATUS } from '@/src/common/constants';
import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';
import { VideoProcessingJobModel } from '@/src/worker/models/job.model';

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
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        { _id: msg._id.toString(), status: FILE_STATUS.PROCESSING, message: 'File processing' }
      );
      let res = await this.transcodingService.transcodeVideoByResolution(msg._id.toString(), height, width);
      console.log(`video ${height}p transcode:`, res);
      this.manifestService.appendManifest(msg._id.toString(), height);
      // this.publishVideoUploadJob(msg._id.toString(), height, width);

    } catch (e: any) {
      console.log(`error while processing ${height}p`, e);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        { _id: msg._id.toString(), status: VIDEO_STATUS.FAILED, message: e.message }
      );
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_PROCESS_VIDEO_QUEUE
  })
  public async handle360(msg: VideoProcessingJobModel) {
    console.log('Video360pProcessingJobHandler', msg);

    let { height, width } = msg;
    await this.processVideo(msg, height, width);
  }


  // publishVideoUploadJob(_id: string, height: number, width: number) {
  //   let jobModel: VideoUploadJobModel = {
  //     _id: _id,
  //     height: height,
  //     width: width
  //   };
  //
  //   let jobDataByHeight = this.jobManagerService.getJobDataByHeight(height);
  //   if (!jobDataByHeight) {
  //     console.log('No job data found for height:', height);
  //     return;
  //   }
  //   return this.rabbitMqService.publish(
  //     AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
  //     jobDataByHeight.uploadRoutingKey,
  //     jobModel
  //   );
  // }
}
