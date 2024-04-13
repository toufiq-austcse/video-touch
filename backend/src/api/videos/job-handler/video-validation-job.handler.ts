import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { VideoService } from '@/src/api/videos/services/video.service';
import { getLocalVideoMp4Path } from '@/src/common/utils';
import { VideoProcessingJobModel, VideoValidationJobModel } from '@/src/api/videos/models/job.model';
import { VideoRepository } from '@/src/api/videos/repositories/video.repository';
import mongoose from 'mongoose';
import { VIDEO_STATUS } from '@/src/common/constants';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { JobManagerService } from '@/src/api/videos/services/job-manager.service';

@Injectable()
export class VideoValidationJobHandler {
  constructor(private videoService: VideoService, private videoRepository: VideoRepository, private rabbitMqService: RabbitMqService,
              private jobManagerService: JobManagerService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_VALIDATE_VIDEO_QUEUE
  })
  public async handle(msg: VideoValidationJobModel) {
    console.log('VideoValidationJobHandler', msg);
    try {
      let videoPath = getLocalVideoMp4Path(msg._id.toString());
      let metadata = await this.videoService.getMetadata(videoPath);
      console.log('metadata', metadata);

      await this.videoRepository.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(msg._id)
      }, {
        size: metadata.size,
        height: metadata.height,
        width: metadata.width,
        duration: metadata.duration
      });
      await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.VALIDATED, 'Video validated');
      this.publishVideoProcessingJob(msg, metadata.height, metadata.width);
      await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.PROCESSING, 'Video processing');

    } catch (e) {
      console.log('error in video validation job handler', e);
    }
  }

  publishVideoProcessingJob(msg: VideoValidationJobModel, height: number, width: number) {
    let jobModel: VideoProcessingJobModel = {
      _id: msg._id.toString()
    };
    let jobData = this.jobManagerService.getRenditionWiseJobDataByHeight(height);
    jobData.forEach(data => {
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, data.processRoutingKey, jobModel);
      console.log('published video processing job', data.processRoutingKey);
    });
  }


}