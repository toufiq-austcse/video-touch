import { Injectable } from '@nestjs/common';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';
import { Models } from '@toufiq-austcse/video-touch-common';


@Injectable()
export class VideoDownloadService {
  constructor(private downloadHttpService: DownloaderHttpService) {
  }

  async download(msg: Models.VideoDownloadJobModel) {
    let destinationPath = 'assets/test.mp4';
    let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
    console.log('assets downloaded:', res);
  }
}
