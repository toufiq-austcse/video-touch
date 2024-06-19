import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, terminal, Utils } from '@toufiq-austcse/video-touch-common';

@Injectable()
export class VideoUploaderJobHandler {
  constructor(
    private s3ClientService: S3ClientService,
    private rabbitMqService: RabbitMqService
  ) {
  }

  async syncDirToS3(localDir: string, s3Dir: string) {
    console.log('syncing dir to s3', localDir, s3Dir);

    let command = `aws s3 sync ${localDir}  ${s3Dir}`;
    if (AppConfigService.appConfig.AWS_PROFILE_NAME) {
      command += ` --profile ${AppConfigService.appConfig.AWS_PROFILE_NAME}`;
    }
    return terminal(command);
  }

  async upload(msg: Models.VideoUploadJobModel) {
    try {
      let localFilePath = Utils.getLocalResolutionPath(msg._id.toString(), msg.height, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      let s3VideoPath = Utils.getS3VideoPath(msg._id.toString(), msg.height, AppConfigService.appConfig.AWS_S3_BUCKET_NAME);
      let res = await this.syncDirToS3(localFilePath, s3VideoPath);
      console.log(`video ${msg.height}p uploaded:`, res);

      await this.s3ClientService.syncMainManifestFile(msg._id.toString());

      let dirSize = await Utils.getDirSize(localFilePath);
      console.log('dir size:', dirSize);

      this.publishUpdateFileStatusEvent(msg._id.toString(), 'File uploaded', dirSize, Constants.FILE_STATUS.READY, msg.height);

    } catch (err: any) {
      console.log('error in uploading ', msg.height, err);

      this.publishUpdateFileStatusEvent(msg._id.toString(), 'File uploading failed', 0, Constants.FILE_STATUS.FAILED, msg.height);
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_UPLOAD_VIDEO_QUEUE
  })
  public async handleUpload(msg: Models.VideoUploadJobModel) {
    console.log(`uploading ${msg.height}p video`, msg._id.toString());
    await this.upload(msg);
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

  buildUpdateFileStatusEventModel(assetId: string, details: string, dirSize: number, status: string, height: number): Models.UpdateFileStatusEventModel {
    return {
      asset_id: assetId, details: details, dir_size: dirSize, height: height, status: status
    };
  }
}
