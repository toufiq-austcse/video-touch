import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoProcessingJobModel, VideoUploadJobModel } from '@/src/api/assets/models/job.model';
import { TranscodingService } from '@/src/api/assets/services/transcoding.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { FILE_STATUS, VIDEO_RESOLUTION } from '@/src/common/constants';
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

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_PROCESS_VIDEO_QUEUE,
  })
  public async handle360(msg: VideoProcessingJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let { height, width } = VIDEO_RESOLUTION['360p'];

      await this.fileService.updateFileStatus(msg._id.toString(), height, FILE_STATUS.PROCESSING, 'File processing');

      let res = await this.transcodingService.transcode360pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
      this.manifestService.appendManifest(msg._id.toString(), height);

      this.publishVideoUploadJob(msg._id.toString(), height, width);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);
    }
  }

  // @RabbitSubscribe({
  //   exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
  //   routingKey: process.env.RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY,
  //   queue: process.env.RABBIT_MQ_480P_PROCESS_VIDEO_QUEUE
  // })
  // public async handle480(msg: VideoValidationJobModel) {
  //   console.log('Video360pProcessingJobHandler', msg);
  //   try {
  //     let res = await this.transcodingService.transcode480pVideo(msg._id.toString());
  //     console.log('video 480p transcoded:', res);
  //
  //     this.publishVideoUploadJob(msg._id.toString(), VIDEO_RESOLUTION['480p'].height);
  //   } catch (e) {
  //     console.log('error in video 360p processing job handler', e);
  //
  //   }
  // }
  //
  // @RabbitSubscribe({
  //   exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
  //   routingKey: process.env.RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY,
  //   queue: process.env.RABBIT_MQ_540P_PROCESS_VIDEO_QUEUE
  // })
  // public async handle540(msg: VideoValidationJobModel) {
  //   console.log('Video360pProcessingJobHandler', msg);
  //   try {
  //     let res = await this.transcodingService.transcode540pVideo(msg._id.toString());
  //     console.log('video 540p transcoded:', res);
  //
  //     this.publishVideoUploadJob(msg._id.toString(), VIDEO_RESOLUTION['540p'].height);
  //   } catch (e) {
  //     console.log('error in video 360p processing job handler', e);
  //
  //   }
  // }
  //
  // @RabbitSubscribe({
  //   exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
  //   routingKey: process.env.RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY,
  //   queue: process.env.RABBIT_MQ_720P_PROCESS_VIDEO_QUEUE
  // })
  // public async handle720(msg: VideoValidationJobModel) {
  //   console.log('Video360pProcessingJobHandler', msg);
  //   try {
  //     let res = await this.transcodingService.transcode720pVideo(msg._id.toString());
  //     console.log('video 720p transcoded:', res);
  //
  //     this.publishVideoUploadJob(msg._id.toString(), VIDEO_RESOLUTION['720p'].height);
  //   } catch (e) {
  //     console.log('error in video 360p processing job handler', e);
  //
  //   }
  // }
  //
  // @RabbitSubscribe({
  //   exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
  //   routingKey: process.env.RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY,
  //   queue: process.env.RABBIT_MQ_1080P_PROCESS_VIDEO_QUEUE
  // })
  // public async handle1080(msg: VideoValidationJobModel) {
  //   console.log('Video360pProcessingJobHandler', msg);
  //   try {
  //     let res = await this.transcodingService.transcode1080pVideo(msg._id.toString());
  //     console.log('video 1080p transcoded:', res);
  //
  //     this.publishVideoUploadJob(msg._id.toString(), VIDEO_RESOLUTION['1080p'].height);
  //   } catch (e) {
  //     console.log('error in video 360p processing job handler', e);
  //
  //   }
  // }

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
