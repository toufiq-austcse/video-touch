import { Models, terminal, Utils, Constants } from 'video-touch-common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as console from 'node:console';
import { Job } from 'bullmq';
import * as process from 'node:process';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';

@Processor(process.env.BULL_VALIDATE_JOB_QUEUE)
export class ValidateVideoWorker extends WorkerHost {
  constructor(private rabbitMqService: RabbitMqService) {
    super();
  }

  async process(job: Job): Promise<any> {
    console.log('VideoValidationJobHandler', job);
    let msg: Models.VideoValidationJobModel = job.data as Models.VideoValidationJobModel;

    try {
      let videoPath = Utils.getLocalVideoMp4Path(
        msg.asset_id.toString(),
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );
      let metadata = await this.getMetadata(videoPath);
      console.log('metadata', metadata);
      if (!metadata || !metadata.size || !metadata.height || !metadata.width || !metadata.duration) {
        throw new Error(`Invalid video metadata: ${JSON.stringify(metadata)}`);
      }

      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY,
        {
          asset_id: msg.asset_id,
          data: {
            size: metadata.size,
            height: metadata.height,
            width: metadata.width,
            duration: metadata.duration,
          },
        },
      );

      this.publishUpdateAssetEvent(msg.asset_id, metadata.size, metadata.height, metadata.width, metadata.duration);

      this.publishUpdateAssetStatusEvent(msg.asset_id, Constants.VIDEO_STATUS.VALIDATED, 'Video validated');
    } catch (e: any) {
      console.log('error in video validation job handler', e);
      let isLastAttempt = this.isLastAttempt(job);
      if (isLastAttempt) {
        this.publishUpdateAssetStatusEvent(msg.asset_id, Constants.VIDEO_STATUS.FAILED, e.message);
      }
      throw new Error('Error in video validation job handler: ' + e.message);
    }
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

  async getMetadata(url: string): Promise<{
    file_name: string;
    size: number;
    height: number;
    width: number;
    duration: number;
  }> {
    let extractMetaCommand = `ffprobe -v quiet -show_streams -show_format -print_format json ${url}`;
    let showStreamCommandRes = await terminal(extractMetaCommand);
    let parsedData = JSON.parse(showStreamCommandRes);
    let videoInfo = parsedData.streams.find((stream) => stream.codec_type === 'video' && stream.height && stream.width);
    if (!videoInfo) {
      throw new Error('No valid video stream found in the file');
    }
    let format = parsedData.format;

    return {
      file_name: format.filename,
      size: +format.size,
      height: videoInfo.height,
      width: videoInfo.width,
      duration: +videoInfo.duration,
    };
  }

  buildUpdateAssetStatusEventModel(
    assetId: string,
    status: string,
    details: string,
  ): Models.UpdateAssetStatusEventModel {
    return {
      asset_id: assetId,
      details: details,
      status: status,
    };
  }

  publishUpdateAssetStatusEvent(assetId: string, status: string, details: string) {
    try {
      let event = this.buildUpdateAssetStatusEventModel(assetId, status, details);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY,
        event,
      );
    } catch (e) {
      console.log('error in publishing update asset status event', e);
    }
  }

  buildUpdateAssetEventModel(
    assetId: string,
    size: number,
    height: number,
    width: number,
    duration: number,
  ): Models.UpdateAssetEventModel {
    return {
      asset_id: assetId,
      data: {
        size,
        height,
        width,
        duration,
      },
    };
  }

  publishUpdateAssetEvent(assetId: string, size: number, height: number, width: number, duration: number) {
    try {
      let event = this.buildUpdateAssetEventModel(assetId, size, height, width, duration);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY,
        event,
      );
    } catch (e) {
      console.log('error in publishing update asset event', e);
    }
  }
}
