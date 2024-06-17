import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { getDirSize, getLocalResolutionPath, getS3VideoPath } from '@/src/common/utils';
import { terminal } from '@/src/common/utils/terminal';
import { FILE_STATUS } from '@/src/common/constants';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { UpdateFileStatusEventModel, VideoUploadJobModel } from '@/src/worker/models/job.model';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

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

  async upload(msg: VideoUploadJobModel) {
    try {
      let localFilePath = getLocalResolutionPath(msg._id.toString(), msg.height);
      let s3VideoPath = getS3VideoPath(msg._id.toString(), msg.height);
      let res = await this.syncDirToS3(localFilePath, s3VideoPath);
      console.log(`video ${msg.height}p uploaded:`, res);

      await this.s3ClientService.syncMainManifestFile(msg._id.toString());

      let dirSize = await getDirSize(localFilePath);
      console.log('dir size:', dirSize);

      this.publishUpdateFileStatusEvent(msg._id.toString(), 'File uploaded', dirSize, FILE_STATUS.READY, msg.height);

    } catch (err: any) {
      console.log('error in uploading ', msg.height, err);

      this.publishUpdateFileStatusEvent(msg._id.toString(), 'File uploading failed', 0, FILE_STATUS.FAILED, msg.height);
    }
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_UPLOAD_VIDEO_QUEUE
  })
  public async handleUpload(msg: VideoUploadJobModel) {
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

  buildUpdateFileStatusEventModel(assetId: string, details: string, dirSize: number, status: string, height: number): UpdateFileStatusEventModel {
    return {
      asset_id: assetId, details: details, dir_size: dirSize, height: height, status: status
    };
  }
}
