import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, terminal, Utils } from '@toufiq-austcse/video-touch-common';


@Injectable()
export class ValidateVideoWorker {
  constructor(private rabbitMqService: RabbitMqService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_VALIDATE_VIDEO_QUEUE
  })
  public async handle(msg: Models.VideoValidationJobModel) {
    console.log('VideoValidationJobHandler', msg);
    try {
      let videoPath = Utils.getLocalVideoMp4Path(msg.asset_id.toString(), AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      let metadata = await this.getMetadata(videoPath);
      console.log('metadata', metadata);

      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY, {
        asset_id: msg.asset_id,
        data: {
          size: metadata.size,
          height: metadata.height,
          width: metadata.width,
          duration: metadata.duration
        }
      });

      this.publishUpdateAssetEvent(msg.asset_id, metadata.size, metadata.height, metadata.width, metadata.duration);

      this.publishUpdateAssetStatusEvent(msg.asset_id, Constants.VIDEO_STATUS.VALIDATED, 'Video validated');

    } catch (e: any) {
      console.log('error in video validation job handler', e);
      this.publishUpdateAssetStatusEvent(msg.asset_id, Constants.VIDEO_STATUS.FAILED, e.message);
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

  buildUpdateAssetStatusEventModel(assetId: string, status: string, details: string): Models.UpdateAssetStatusEventModel {
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

  buildUpdateAssetEventModel(assetId: string, size: number, height: number, width: number, duration: number): Models.UpdateAssetEventModel {
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
