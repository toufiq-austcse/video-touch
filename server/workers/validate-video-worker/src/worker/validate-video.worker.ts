import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { getLocalVideoMp4Path } from '@/src/common/utils';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { VIDEO_STATUS } from '@/src/common/constants';
import { VideoValidationJobModel } from '@/src/worker/models/job.model';
import { terminal } from '@/src/common/utils/terminal';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UpdateAssetEventModel, UpdateAssetStatusEventModel } from '@/src/worker/models/event.model';

@Injectable()
export class ValidateVideoWorker {
  constructor(private rabbitMqService: RabbitMqService) {
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
      let metadata = await this.getMetadata(videoPath);
      console.log('metadata', metadata);

      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY, {
        asset_id: msg._id,
        data: {
          size: metadata.size,
          height: metadata.height,
          width: metadata.width,
          duration: metadata.duration
        }
      });

      this.publishUpdateAssetEvent(msg._id, metadata.size, metadata.height, metadata.width, metadata.duration);

      this.publishUpdateAssetStatusEvent(msg._id, VIDEO_STATUS.VALIDATED, 'Video validated');

    } catch (e: any) {
      console.log('error in video validation job handler', e);
      this.publishUpdateAssetStatusEvent(msg._id, VIDEO_STATUS.FAILED, e.message);
    }
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
    let videoInfo = parsedData.streams[0];
    let format = parsedData.format;

    return {
      file_name: format.filename,
      size: +format.size,
      height: videoInfo.height,
      width: videoInfo.width,
      duration: +videoInfo.duration
    };
  }

  buildUpdateAssetStatusEventModel(assetId: string, status: string, details: string): UpdateAssetStatusEventModel {
    return {
      asset_id: assetId, details: details, status: status
    };
  }

  publishUpdateAssetStatusEvent(assetId: string, status: string, details: string) {
    try {
      let event = this.buildUpdateAssetStatusEventModel(assetId, status, details);
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY, event);
    } catch (e) {
      console.log('error in publishing update asset status event', e);

    }
  }

  buildUpdateAssetEventModel(assetId: string, size: number, height: number, width: number, duration: number): UpdateAssetEventModel {
    return {
      asset_id: assetId,
      data: {
        size,
        height,
        width,
        duration
      }
    };
  }

  publishUpdateAssetEvent(assetId: string, size: number, height: number, width: number, duration: number) {
    try {
      let event = this.buildUpdateAssetEventModel(assetId, size, height, width, duration);
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY, event);
    } catch (e) {
      console.log('error in publishing update asset event', e);
    }
  }
}
