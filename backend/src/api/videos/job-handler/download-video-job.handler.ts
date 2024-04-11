import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as process from 'process';
import { VideoDownloadJobModel } from '@/src/api/videos/models/job.mode';
import { VideoDownloadService } from '@/src/api/videos/services/video-download.service';
import { VideoService } from '@/src/api/videos/services/video.service';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class DownloadVideoJobHandler {
  constructor(private videoDownloadService: VideoDownloadService, private videoService: VideoService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE
  })
  public async handle(msg: VideoDownloadJobModel) {
    console.log('DownloadVideoJobHandler', msg);
    await this.videoService.insertVideoStatus(msg._id, VIDEO_STATUS.DOWNLOADING, 'Downloading video');
    this.videoDownloadService
      .download(msg)
      .then((msg) => {
        console.log('video downloaded', msg);
      })
      .catch((err) => {
        console.log('Error in video downloading', err);
      });
  }
}