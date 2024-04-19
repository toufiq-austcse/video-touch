import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

import { AssetService } from '@/src/api/assets/services/asset.service';
import { getLocalVideoMp4Path } from '@/src/common/utils';
import { JobMetadataModel, VideoProcessingJobModel, VideoValidationJobModel } from '@/src/api/assets/models/job.model';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import mongoose from 'mongoose';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { VIDEO_STATUS } from '@/src/common/constants';
import { FileService } from '@/src/api/assets/services/file.service';

@Injectable()
export class VideoValidationJobHandler {
  constructor(private assetService: AssetService,
              private fileService: FileService,
              private assetRepository: AssetRepository,
              private rabbitMqService: RabbitMqService,
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
      let metadata = await this.assetService.getMetadata(videoPath);
      console.log('metadata', metadata);

      await this.assetRepository.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(msg._id)
      }, {
        size: metadata.size,
        height: metadata.height,
        width: metadata.width,
        duration: metadata.duration
      });
      await this.assetService.updateVideoStatus(msg._id, VIDEO_STATUS.VALIDATED, 'Video validated');

      let jobData = this.jobManagerService.getRenditionWiseJobDataByHeight(metadata.height);
      this.publishVideoProcessingJob(msg, jobData);
      await this.insertFilesData(msg, jobData);

      await this.assetService.updateVideoStatus(msg._id, VIDEO_STATUS.PROCESSING, 'Video processing');

    } catch (e: any) {
      console.log('error in video validation job handler', e);
      await this.assetService.updateVideoStatus(msg._id, VIDEO_STATUS.FAILED, e.message);
    }
  }

  publishVideoProcessingJob(msg: VideoValidationJobModel, jobMetadata: JobMetadataModel[]) {
    let jobModel: VideoProcessingJobModel = {
      _id: msg._id.toString()
    };

    jobMetadata.forEach(data => {
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, data.processRoutingKey, jobModel);
      console.log('published video processing job', data.processRoutingKey);
    });
  }


  private async insertFilesData(msg: VideoValidationJobModel, jobData: JobMetadataModel[]) {
    for (let data of jobData) {
      await this.fileService.createFileAfterValidation(msg, data);
    }

  }
}