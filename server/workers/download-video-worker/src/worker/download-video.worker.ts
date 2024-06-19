import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Utils, Models } from '@toufiq-austcse/video-touch-common';

@Injectable()
export class DownloadVideoJobHandler {
  constructor(private downloadHttpService: DownloaderHttpService, private rabbitMqService: RabbitMqService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE
  })
  public async handle(msg: Models.VideoDownloadJobModel) {
    try {
      let destinationPath = Utils.getLocalVideoMp4Path(msg._id.toString(), AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      await this.download(msg, destinationPath);

      this.publishUpdateAssetEvent(msg._id, Constants.VIDEO_STATUS.DOWNLOADED, 'Video downloaded');

    } catch (e: any) {
      console.log('error in video download job handler', e);
      this.publishUpdateAssetEvent(msg._id, Constants.VIDEO_STATUS.FAILED, e.message);

    }
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
      details: details
    };
  }

  publishUpdateAssetEvent(assetId: string, status: string, details: string) {
    try {
      let updateAssetEvent = this.buildAssetUpdateEventModel(assetId, status, details);
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY, updateAssetEvent);

    } catch (e) {
      console.log('error while publishing update asset event', e);
    }

  }
}
