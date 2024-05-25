import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { getLocalVideoMp4Path } from '@/src/common/utils';
import { VideoDownloadJobModel } from '@/src/worker/models/job.model';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class DownloadVideoJobHandler {
  constructor(private downloadHttpService: DownloaderHttpService, private rabbitMqService: RabbitMqService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE
  })
  public async handle(msg: VideoDownloadJobModel) {
    try {
      let destinationPath = getLocalVideoMp4Path(msg._id.toString());
      await this.download(msg, destinationPath);
      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY, {
          asset_id: msg._id,
          status: VIDEO_STATUS.DOWNLOADED,
          details: 'Video downloaded'
        });

    } catch (e: any) {
      console.log('error in video download job handler', e);

      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY, {
          asset_id: msg._id,
          status: VIDEO_STATUS.FAILED,
          details: e.message
        });

    }
  }

  async download(msg: VideoDownloadJobModel, destinationPath: string) {
    try {
      let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
      console.log('assets downloaded:', res);
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
