import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as process from 'process';
import { VideoValidationJobModel } from '@/src/api/videos/models/job.model';
import { TranscodingService } from '@/src/api/videos/services/transcoding.service';

@Injectable()
export class VideoProcessorJobHandler {
  constructor(private transcodingService: TranscodingService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_VIDEO_QUEUE
  })
  public async handle360(msg: VideoValidationJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let res = await this.transcodingService.transcode360pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_480P_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_480P_VIDEO_QUEUE
  })
  public async handle480(msg: VideoValidationJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let res = await this.transcodingService.transcode480pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_540P_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_540P_VIDEO_QUEUE
  })
  public async handle540(msg: VideoValidationJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let res = await this.transcodingService.transcode540pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_720P_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_720P_VIDEO_QUEUE
  })
  public async handle720(msg: VideoValidationJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let res = await this.transcodingService.transcode720pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_1080P_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_1080P_VIDEO_QUEUE
  })
  public async handle1080(msg: VideoValidationJobModel) {
    console.log('Video360pProcessingJobHandler', msg);
    try {
      let res = await this.transcodingService.transcode1080pVideo(msg._id.toString());
      console.log('video 360p transcoded:', res);
    } catch (e) {
      console.log('error in video 360p processing job handler', e);

    }
  }


}