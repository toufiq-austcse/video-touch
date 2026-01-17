import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, terminal, Utils } from 'video-touch-common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as process from 'node:process';
import * as console from 'node:console';
import { Job } from 'bullmq';
import fs from 'fs';
import { BunnyHttpService } from '@/src/common/bunny/service/bunny-http.service';
import { FILE_SYNC_PROVIDER } from '@/src/common/constants';

@Processor(process.env.BULL_UPLOAD_JOB_QUEUE, { concurrency: 3 })
export class VideoUploaderJobHandler extends WorkerHost {
  constructor(
    private s3ClientService: S3ClientService,
    private bunnyClientService: BunnyHttpService,
    private rabbitMqService: RabbitMqService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    let msg: Models.FileUploadJobModel = job.data as Models.FileUploadJobModel;
    console.log(`uploading ${msg.height}p video`, msg.asset_id.toString());
    let isLastAttempt = this.isLastAttempt(job);

    if (msg.type === Constants.FILE_TYPE.SOURCE) {
      return this.uploadSourceFile(msg, isLastAttempt);
    } else if (msg.type === Constants.FILE_TYPE.PLAYLIST) {
      return this.uploadManifestFiles(msg, isLastAttempt);
    } else if (msg.type === Constants.FILE_TYPE.DOWNLOAD) {
      return this.uploadDownloadFile(msg, isLastAttempt);
    } else if (msg.type === Constants.FILE_TYPE.AUDIO) {
      return this.uploadAudioFile(msg, isLastAttempt);
    } else if (msg.type === Constants.FILE_TYPE.TRANSCRIPT) {
      return this.uploadTranscriptFile(msg, isLastAttempt);
    }
    return;
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

  async uploadManifestFiles(msg: Models.FileUploadJobModel, isLastAttempt: boolean) {
    try {
      let localFilePath = Utils.getLocalResolutionPath(
        msg.asset_id.toString(),
        msg.height,
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );
      if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.S3) {
        let s3VideoPath = Utils.getS3UriVideoPathByHeight(
          msg.asset_id.toString(),
          msg.height,
          AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        );
        let res = await this.syncDirToS3(localFilePath, s3VideoPath);
        console.log(`video ${msg.height}p uploaded:`, res);
        await this.s3ClientService.syncMainManifestFile(msg.asset_id.toString());
        console.log('main manifest synced to s3');
      } else if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.RCLONE) {
        const destinationPath = `videos/${msg.asset_id}/${msg.height}`;
        let res = await this.bunnyClientService.syncDirToBunny(localFilePath, destinationPath);
        console.log(`video ${msg.height}p uploaded:`, res);
        await this.bunnyClientService.syncMainManifestFile(msg.asset_id.toString());
        console.log('main manifest synced to Bunny');
      }

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
        return;
      }
      throw new Error(`Error in uploading video at ${msg.height}p: ${err.message}`);
    }
  }

  async uploadSourceFile(msg: Models.FileUploadJobModel, isLatAttempt: boolean) {
    try {
      let localFilePath = `${Utils.getLocalVideoRootPath(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      )}/${msg.asset_id}.mp4`;

      if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.S3) {
        let s3SourceFileVideoPath = Utils.getS3UriSourceFileVideoPath(
          msg.asset_id.toString(),
          msg.name,
          AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        );
        let res = await this.syncFileToS3(localFilePath, s3SourceFileVideoPath);
        console.log(`source file uploaded:`, res);
      } else if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.RCLONE) {
        // let s3SourceFileVideoPath = Utils.getS3UriSourceFileVideoPath(
        //   msg.asset_id.toString(),
        //   msg.name,
        //   AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        // );
        const destinationPath = `videos/${msg.asset_id}/${msg.name}`;
        let res = await this.bunnyClientService.syncFileToBunny(localFilePath, destinationPath);
        console.log(`source file uploaded:`, res);
      } else {
        console.log('FILE_SYNC_PROVIDER value must be either s3 or rclone');
        throw new Error('FILE_SYNC_PROVIDER value must be either s3 or rclone');
      }

      this.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Source file uploaded',
        msg.size,
        Constants.FILE_STATUS.READY,
      );
    } catch (err: any) {
      console.log('error in uploading source file', err);

      if (isLatAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'Source file uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error in uploading source file: ${err.message}`);
    }
  }

  async uploadDownloadFile(msg: Models.FileUploadJobModel, isLatAttempt: boolean) {
    try {
      let localFilePath = `${Utils.getLocalVideoRootPath(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      )}/${msg.name}`;

      if (AppConfigService.appConfig.FILE_SYNC_PROVIDER == FILE_SYNC_PROVIDER.S3) {
        let s3SourceFileVideoPath = Utils.getS3UriSourceFileVideoPath(
          msg.asset_id.toString(),
          msg.name,
          AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        );
        let res = await this.syncFileToS3(localFilePath, s3SourceFileVideoPath);
        console.log(`source file uploaded:`, res);
      } else if (AppConfigService.appConfig.FILE_SYNC_PROVIDER == FILE_SYNC_PROVIDER.RCLONE) {
        const destinationPath = `videos/${msg.asset_id}/${msg.name}`;
        let res = await this.bunnyClientService.syncFileToBunny(localFilePath, destinationPath);
        console.log(`source file uploaded:`, res);
      } else {
        console.log('FILE_SYNC_PROVIDER value must be either s3 or rclone');
        throw new Error('FILE_SYNC_PROVIDER value must be either s3 or rclone');
      }

      let fileSize = await this.getFileSize(localFilePath);

      this.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Source file uploaded',
        fileSize,
        Constants.FILE_STATUS.READY,
      );
    } catch (err: any) {
      console.log('error in uploading source file', err);

      if (isLatAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'Source file uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error in uploading source file: ${err.message}`);
    }
  }

  async uploadAudioFile(msg: Models.FileUploadJobModel, isLatAttempt: boolean) {
    try {
      let localFilePath = `${Utils.getLocalVideoRootPath(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      )}/${msg.name}`;

      if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.S3) {
        let s3SourceFileVideoPath = Utils.getS3UriSourceFileVideoPath(
          msg.asset_id.toString(),
          msg.name,
          AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        );
        let res = await this.syncFileToS3(localFilePath, s3SourceFileVideoPath);
        console.log(`audio file uploaded:`, res);
      } else if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.RCLONE) {
        const destinationPath = `videos/${msg.asset_id}/${msg.name}`;
        let res = await this.bunnyClientService.syncFileToBunny(localFilePath, destinationPath);
        console.log(`audio file uploaded:`, res);
      } else {
        console.log('FILE_SYNC_PROVIDER value must be either s3 or rclone');
        throw new Error('FILE_SYNC_PROVIDER value must be either s3 or rclone');
      }

      let fileSize = await this.getFileSize(localFilePath);
      console.log('audio file size:', fileSize);

      this.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Source file uploaded',
        fileSize,
        Constants.FILE_STATUS.READY,
      );
    } catch (err: any) {
      console.log('error in uploading source file', err);

      if (isLatAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'Source file uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error in uploading source file: ${err.message}`);
    }
  }
  async uploadTranscriptFile(msg: Models.FileUploadJobModel, isLatAttempt: boolean) {
    try {
      let localFilePath = Utils.getLocalTranscriptPath(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );

      if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.S3) {
        let s3SourceFileVideoPath = Utils.getS3UriSourceFileVideoPath(
          msg.asset_id.toString(),
          msg.name,
          AppConfigService.appConfig.AWS_S3_BUCKET_NAME,
        );
        let res = await this.syncFileToS3(localFilePath, s3SourceFileVideoPath);
        console.log(`transcript file uploaded:`, res);
      } else if (AppConfigService.appConfig.FILE_SYNC_PROVIDER === FILE_SYNC_PROVIDER.RCLONE) {
        const destinationPath = `videos/${msg.asset_id}/${msg.name}`;
        let res = await this.bunnyClientService.syncFileToBunny(localFilePath, destinationPath);
        console.log(`transcript file uploaded:`, res);
      } else {
        console.log('FILE_SYNC_PROVIDER value must be either s3 or rclone');
        throw new Error('FILE_SYNC_PROVIDER value must be either s3 or rclone');
      }

      let fileSize = await this.getFileSize(localFilePath);
      console.log('transcript file size:', fileSize);

      this.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Source file uploaded',
        fileSize,
        Constants.FILE_STATUS.READY,
      );
    } catch (err: any) {
      console.log('error in uploading source file', err);

      if (isLatAttempt) {
        this.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          'Source file uploading failed',
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
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

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.promises.stat(filePath);
      return stats.size; // Returns size in bytes
    } catch (error: any) {
      throw new Error(`Failed to get file size: ${error.message}`);
    }
  }
}
