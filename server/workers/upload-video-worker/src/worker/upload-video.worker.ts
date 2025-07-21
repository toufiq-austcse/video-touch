import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, terminal, Utils } from 'video-touch-common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as process from 'node:process';
import * as console from 'node:console';
import { Job } from 'bullmq';

@Processor(process.env.BULL_UPLOAD_JOB_QUEUE)
export class VideoUploaderJobHandler extends WorkerHost {
  constructor(
    private s3ClientService: S3ClientService,
    private rabbitMqService: RabbitMqService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    let msg: Models.VideoUploadJobModel = job.data as Models.VideoUploadJobModel;
    console.log(`uploading ${msg.height}p video`, msg.asset_id.toString());
    let isLastAttempt = this.isLastAttempt(job);

    if (msg.type === Constants.FILE_TYPE.SOURCE) {
      return this.uploadSourceFile(msg, isLastAttempt);
    } else {
      return this.uploadManifestFiles(msg, isLastAttempt);
    }
  }

  async syncDirToS3(localDir: string, s3Dir: string) {
    console.log('syncing dir to s3', localDir, s3Dir);

    let command = `aws s3 sync ${localDir}  ${s3Dir}`;
    if (AppConfigService.appConfig.AWS_PROFILE_NAME) {
      command += ` --profile ${AppConfigService.appConfig.AWS_PROFILE_NAME}`;
    }
    return terminal(command);
  }

  async syncFileToS3(localFile: string, s3File: string) {
    console.log('syncing file to s3', localFile, s3File);

    let command = `aws s3 cp ${localFile} ${s3File}`;
    if (AppConfigService.appConfig.AWS_PROFILE_NAME) {
      command += ` --profile ${AppConfigService.appConfig.AWS_PROFILE_NAME}`;
    }
    return terminal(command);
  }

  isLastAttempt(job: Job): boolean {
    console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

    // Check if the job has been retried more than the maximum allowed attempts
    if (job.attemptsMade + 1 >= job.opts.attempts) {
      console.log(`Job ${job.id} has reached the maximum retry limit.`);
      return true; // This is the last attempt
    }
    return false; // There are more attempts left
  }

  async uploadManifestFiles(msg: Models.VideoUploadJobModel, isLastAttempt: boolean) {
    try {
      let localFilePath = Utils.getLocalResolutionPath(
        msg.asset_id.toString(),
        msg.height,
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );
      let s3VideoPath = Utils.getS3VideoPathByHeight(
        msg.asset_id.toString(),
        msg.height,
        AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
      );
      let res = await this.syncDirToS3(localFilePath, s3VideoPath);
      console.log(`video ${msg.height}p uploaded:`, res);

      await this.s3ClientService.syncMainManifestFile(msg.asset_id.toString());

      let dirSize = await Utils.getDirSize(localFilePath);
      console.log('dir size:', dirSize);

      this.publishUpdateFileStatusEvent(msg.file_id.toString(), 'File uploaded', dirSize, Constants.FILE_STATUS.READY);
    } catch (err: any) {
      console.log('error in uploading ', msg.height, err);
      if (isLastAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'File uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
      }
      throw new Error(`Error in uploading video at ${msg.height}p: ${err.message}`);
    }
  }

  async uploadSourceFile(msg: Models.VideoUploadJobModel, isLatAttempt: boolean) {
    try {
      let localFilePath = `${Utils.getLocalVideoRootPath(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      )}/${msg.asset_id}.mp4`;

      let s3SourceFileVideoPath = Utils.getS3SourceFileVideoPath(
        msg.asset_id.toString(),
        msg.name,
        AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
      );
      let res = await this.syncFileToS3(localFilePath, s3SourceFileVideoPath);
      console.log(`source file uploaded:`, res);

      this.publishUpdateFileStatusEvent(msg.file_id.toString(), 'Source file uploaded', 0, Constants.FILE_STATUS.READY);
    } catch (err: any) {
      console.log('error in uploading source file', err);

      if (isLatAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'Source file uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
      }
      throw new Error(`Error in uploading source file: ${err.message}`);
    }
  }

  publishUpdateFileStatusEvent(fileId: string, details: string, dirSize: number, status: string) {
    try {
      let updateFileStatusEvent = this.buildUpdateFileStatusEventModel(fileId, details, dirSize, status);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        updateFileStatusEvent,
      );
    } catch (e) {
      console.log('error while publishing update file status event', e);
    }
  }

  buildUpdateFileStatusEventModel(
    fileId: string,
    details: string,
    dirSize: number,
    status: string,
  ): Models.UpdateFileStatusEventModel {
    return {
      file_id: fileId,
      details: details,
      dir_size: dirSize,
      status: status,
    };
  }
}
