import { Injectable } from '@nestjs/common';
import { VideoDownloadJobModel } from '@/src/api/assets/models/job.model';
import { DownloaderHttpService } from '@/src/common/http-clients/downloader/downloader-http.service';

@Injectable()
export class VideoDownloadService {
  constructor(private downloadHttpService: DownloaderHttpService) {
  }

  async download(msg: VideoDownloadJobModel) {
    let destinationPath = 'assets/test.mp4';
    let res = await this.downloadHttpService.downloadVideo(msg.source_url, destinationPath);
    console.log('assets downloaded:', res);

  }
}