import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoDownloadJobModel } from '@/src/api/assets/models/job.model';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { getLocalVideoMp4Path } from '@/src/common/utils';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class DownloadVideoJobHandler {
  constructor(private assetService: AssetService, private downloadHttpService: DownloaderHttpService) {}

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE,
  })
  public async handle(msg: VideoDownloadJobModel) {
    try {
      console.log('DownloadVideoJobHandler', msg);
      await this.assetService.updateAssetStatus(msg._id, VIDEO_STATUS.DOWNLOADING, 'Downloading assets');

      let destinationPath = getLocalVideoMp4Path(msg._id.toString());
      await this.download(msg, destinationPath);
      await this.assetService.updateAssetStatus(msg._id, VIDEO_STATUS.DOWNLOADED, 'Video downloaded');

      await this.assetService.pushValidateVideoJob(msg._id.toString());
    } catch (e: any) {
      console.log('error in video download job handler', e);

      this.assetService
        .updateAssetStatus(msg._id, VIDEO_STATUS.FAILED, e.message)
        .then(() => {
          console.log('asset status changed to failed');
        })
        .catch((err) => {
          console.log('error while setting asset status to failed ', err);
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
