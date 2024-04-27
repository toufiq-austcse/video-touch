import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoUploadJobModel } from '@/src/api/assets/models/job.model';
import { getDirSize, getLocalResolutionPath, getS3VideoPath } from '@/src/common/utils';
import { terminal } from '@/src/common/utils/terminal';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import mongoose from 'mongoose';
import { FILE_STATUS, VIDEO_STATUS } from '@/src/common/constants';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { FileService } from '@/src/api/assets/services/file.service';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';

@Injectable()
export class VideoUploaderJobHandler {
  constructor(
    private assetService: AssetService,
    private assetRepository: AssetRepository,
    private fileService: FileService,
    private s3ClientService: S3ClientService
  ) {
  }

  async syncDirToS3(localDir: string, s3Dir: string) {
    console.log('syncing dir to s3', localDir, s3Dir);

    let command = `aws s3 sync ${localDir}  ${s3Dir} --profile video-touch --acl public-read`;
    return terminal(command);
  }

  async handleUpload(msg: VideoUploadJobModel) {
    try {
      let localFilePath = getLocalResolutionPath(msg._id.toString(), msg.height);
      let s3VideoPath = getS3VideoPath(msg._id.toString(), msg.height);
      let res = await this.syncDirToS3(localFilePath, s3VideoPath);
      console.log(`video ${msg.height}p uploaded:`, res);

      await this.s3ClientService.syncMainManifestFile(msg._id.toString());

      let dirSize = await getDirSize(localFilePath);
      console.log('dir size:', dirSize);

      await this.fileService.updateFileStatus(
        msg._id.toString(),
        msg.height,
        FILE_STATUS.READY,
        'File uploaded',
        dirSize
      );

      let video = await this.assetRepository.findOne({
        _id: mongoose.Types.ObjectId(msg._id.toString())
      });

      if (!video) {
        throw new Error('video not found');
      }

      if (video.latest_status !== VIDEO_STATUS.READY) {
        await this.assetService.updateAssetStatus(msg._id.toString(), VIDEO_STATUS.READY, 'Video ready');
      }

    } catch (err: any) {
      console.log('error in uploading ', msg.height);
      this.fileService.updateFileStatus(msg._id.toString(), msg.height, FILE_STATUS.FAILED, err.message)
        .then()
        .catch(err => {
          console.log('error while updating files status ', err);
        });

    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE
  })
  public async handle360PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 360p video', msg._id.toString());
    await this.handleUpload(msg);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_480P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_480P_UPLOAD_VIDEO_QUEUE
  })
  public async handle480PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 480p video', msg._id.toString());
    await this.handleUpload(msg);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_540P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_540P_UPLOAD_VIDEO_QUEUE
  })
  public async handle540PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 540p video', msg._id.toString());
    await this.handleUpload(msg);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_720P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_720P_UPLOAD_VIDEO_QUEUE
  })
  public async handle720PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 720p video', msg._id.toString());
    await this.handleUpload(msg);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_1080P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_1080P_UPLOAD_VIDEO_QUEUE
  })
  public async handle10800PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 1080p video', msg._id.toString());
    await this.handleUpload(msg);
  }
}
