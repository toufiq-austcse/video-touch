import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  VideoProcessingJobModel,
  VideoUploadJobModel,
  VideoValidationJobModel,
} from '@/src/api/assets/models/job.model';
import { TranscodingService } from '@/src/api/assets/services/transcoding.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { FILE_STATUS, VIDEO_RESOLUTION, VIDEO_STATUS } from '@/src/common/constants';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FileService } from '@/src/api/assets/services/file.service';
import { ManifestService } from '@/src/api/assets/services/manifest.service';

@Injectable()
export class VideoProcessorJobHandler {
  constructor(
    private transcodingService: TranscodingService,
    private rabbitMqService: RabbitMqService,
    private jobManagerService: JobManagerService,
    private fileService: FileService,
    private manifestService: ManifestService
  ) {}

  async processVideo(msg: VideoProcessingJobModel, height: number, width: number) {
    try {
      await this.fileService.updateFileStatus(msg._id.toString(), height, FILE_STATUS.PROCESSING, 'File processing');

      let res = await this.transcodingService.transcodeVideoByResolution(msg._id.toString(), height, width);
      console.log(`video ${height}p transcode:`, res);
      this.manifestService.appendManifest(msg._id.toString(), height);

      this.publishVideoUploadJob(msg._id.toString(), height, width);
    } catch (e: any) {
      console.log(`error while processing ${height}p`, e);
      this.fileService
        .updateFileStatus(msg._id.toString(), height, VIDEO_STATUS.FAILED, e.message)
        .then()
        .catch((err) => {
          console.log('error while updating asset status ', err);
        });
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_PROCESS_VIDEO_QUEUE,
  })
  public async handle360(msg: VideoProcessingJobModel) {
    console.log('Video360pProcessingJobHandler', msg);

    let { height, width } = VIDEO_RESOLUTION['360p'];
    await this.processVideo(msg, height, width);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_480P_PROCESS_VIDEO_QUEUE,
  })
  public async handle480(msg: VideoValidationJobModel) {
    console.log('Video480pProcessingJobHandler', msg);

    let { height, width } = VIDEO_RESOLUTION['480p'];
    await this.processVideo(msg, height, width);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_540P_PROCESS_VIDEO_QUEUE,
  })
  public async handle540(msg: VideoValidationJobModel) {
    console.log('Video540pProcessingJobHandler', msg);

    let { height, width } = VIDEO_RESOLUTION['540p'];
    await this.processVideo(msg, height, width);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_720P_PROCESS_VIDEO_QUEUE,
  })
  public async handle720(msg: VideoValidationJobModel) {
    console.log('Video720pProcessingJobHandler', msg);

    let { height, width } = VIDEO_RESOLUTION['720p'];
    await this.processVideo(msg, height, width);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_1080P_PROCESS_VIDEO_QUEUE,
  })
  public async handle1080(msg: VideoValidationJobModel) {
    console.log('Video1080pProcessingJobHandler', msg);

    let { height, width } = VIDEO_RESOLUTION['1080p'];
    await this.processVideo(msg, height, width);
  }

  publishVideoUploadJob(_id: string, height: number, width: number) {
    let jobModel: VideoUploadJobModel = {
      _id: _id,
      height: height,
      width: width,
    };

    let jobDataByHeight = this.jobManagerService.getJobDataByHeight(height);
    if (!jobDataByHeight) {
      console.log('No job data found for height:', height);
      return;
    }
    return this.rabbitMqService.publish(
      AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
      jobDataByHeight.uploadRoutingKey,
      jobModel
    );
  }
}
