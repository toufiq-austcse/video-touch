import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { Models, Utils, Constants } from 'video-touch-common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as process from 'node:process';
import * as console from 'node:console';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';

@Processor(process.env.BULL_DOWNLOAD_JOB_QUEUE)
export class DownloadVideoJobHandler extends WorkerHost implements OnModuleInit {
  constructor(
    private downloadHttpService: DownloaderHttpService,
    private rabbitMqService: RabbitMqService,
  ) {
    super();
  }

  onModuleInit() {
    console.log('DownloadVideoJobHandler initialized with queue:', process.env.BULL_DOWNLOAD_JOB_QUEUE);
  }

  async process(job: Job): Promise<any> {
    console.log('DownloadVideoJobHandler', job.data);
    let msg: Models.VideoDownloadJobModel = job.data as Models.VideoDownloadJobModel;
    let isLastAttempt = this.isLastAttempt(job);

    try {
      let destinationPath = Utils.getLocalVideoMp4Path(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );
      await this.download(msg, destinationPath);

      this.publishUpdateAssetEvent(msg.asset_id, Constants.VIDEO_STATUS.DOWNLOADED, 'Video downloaded');
      return Promise.resolve(null);
    } catch (e: any) {
      console.log('error in video download job handler', e);

      if (isLastAttempt) {
        this.publishUpdateAssetEvent(msg.asset_id, Constants.VIDEO_STATUS.FAILED, e.message);
      }
      throw e;
    }
  }

  isLastAttempt(job: Job): boolean {
    console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

    // Check if the job has been retried more than the maximum allowed attempts
    if (job.attemptsMade+1 >= job.opts.attempts) {
      console.log(`Job ${job.id} has reached the maximum retry limit.`);
      return true; // This is the last attempt
    }
    return false; // There are more attempts left
  }

  async download(msg: Models.VideoDownloadJobModel, destinationPath: string) {
    try {
      let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
      console.log('assets downloaded:', res);
    } catch (e: any) {
      throw new Error(e);
    }
  }

  buildAssetUpdateEventModel(assetId: string, status: string, details: string): Models.UpdateAssetStatusEventModel {
    return {
      asset_id: assetId,
      status: status,
      details: details,
    };
  }

  publishUpdateAssetEvent(assetId: string, status: string, details: string) {
    try {
      let updateAssetEvent = this.buildAssetUpdateEventModel(assetId, status, details);

      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY,
        updateAssetEvent,
      );
    } catch (e) {
      console.log('error while publishing update asset event', e);
    }
  }
}
