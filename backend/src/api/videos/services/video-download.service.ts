import { Injectable } from '@nestjs/common';
import { VideoDownloadJobModel } from '@/src/api/videos/models/job.mode';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';

@Injectable()
export class VideoDownloadService {
  constructor(private downloadHttpService: DownloaderHttpService) {
  }

  async download(msg: VideoDownloadJobModel) {
    let destinationPath = 'videos/test.mp4';
    let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
    console.log('video downloaded:', res);

  }
}