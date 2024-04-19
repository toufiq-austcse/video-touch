import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import axios from 'axios';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Injectable()
export class DownloaderHttpService {
  constructor(private httpService: HttpService) {
  }

  async download(url: string) {
    let response = await firstValueFrom(this.httpService.get(url, { responseType: 'stream' }));
    response.data.pipe(fs.createWriteStream('test.mp4', { flags: 'w' }));
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        console.log('download done...');
        resolve('done');
      });

      response.data.on('error', (err) => {
        console.log('download error...', err);
        reject(err);
      });
    });
  }

  async downloadVideo(videoUrl: string, outputFilePath: string): Promise<string> {
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    console.log('Response:', response.headers['content-type']);
    if (response.headers['content-type'] !== 'video/mp4') {
      throw new Error('Invalid video URL');
    }

    const totalSize = response.headers['content-length'];
    console.log('Total size:', totalSize);
    if (totalSize > AppConfigService.appConfig.MAX_VIDEO_SIZE_IN_BYTES) {
      throw new Error('Video size is greater than allowed size');
    }

    let downloadedSize = 0;
    const writer = fs.createWriteStream(outputFilePath, { flags: 'w' });

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const percent = (downloadedSize / totalSize) * 100;
      //  process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Downloading... ${percent.toFixed(2)}%`);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Downloaded successfully');
        resolve(outputFilePath);
      });
      writer.on('error', (err) => {
        console.error('Error downloading assets:', err);
        reject(err);
      });
    });
  }
}
