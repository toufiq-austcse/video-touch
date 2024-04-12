import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as process from 'process';
import { VideoDownloadJobModel, VideoValidationJobModel } from '@/src/api/videos/models/job.model';
import { VideoService } from '@/src/api/videos/services/video.service';
import { VIDEO_STATUS } from '@/src/common/constants';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { getLocalVideoMp4Path } from '@/src/common/utils';

@Injectable()
export class DownloadVideoJobHandler {
  constructor(private videoService: VideoService,
              private downloadHttpService: DownloaderHttpService,
              private rabbitMqService: RabbitMqService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE
  })
  public async handle(msg: VideoDownloadJobModel) {
    try {
      console.log('DownloadVideoJobHandler', msg);
      await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.DOWNLOADING, 'Downloading videos');

      let destinationPath = getLocalVideoMp4Path(msg._id.toString());
      await this.download(msg, destinationPath);

      await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.DOWNLOADED, 'Video downloaded');

      this.rabbitMqService.publish(AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, AppConfigService.appConfig.RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY, {
        _id: msg._id
      } as VideoValidationJobModel);

    } catch (e) {
      console.log('error in video download job handler', e);
    }


  }

  async download(msg: VideoDownloadJobModel, destinationPath: string) {
    try {
      let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
      console.log('videos downloaded:', res);
    } catch (e: any) {
      console.log('Error downloading video', e.message);
      try {
        await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.FAILED, e.message);
      } catch (e: any) {
        console.log('Error inserting video status', e.message);
      }

    }
  }
}