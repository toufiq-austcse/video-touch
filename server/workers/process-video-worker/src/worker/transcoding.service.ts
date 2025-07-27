import { Injectable } from '@nestjs/common';
import { Utils, terminal } from 'video-touch-common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Injectable()
export class TranscodingService {
  constructor() {}

  async transcodeVideo(inputFilePath: string, outputFolderPath: string, height: number, width: number) {
    let command = `ffmpeg -i ${inputFilePath} -c:v libx264 -profile:v high -level 4.0 -crf 28 -c:a aac -b:a 128k -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFolderPath}/${height}_out.m3u8`;
    //let command = `ffmpeg -i ${inputFilePath} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFolderPath}/${height}_out.m3u8`;
    console.log('starting transcoding.... ', height);
    return terminal(command);
  }

  async createMp4FromM3u8(masterPlaylistPath: string, outputPath: string) {
    // Using ffmpeg to convert local HLS stream to MP4
    const command = `ffmpeg -y -i ${masterPlaylistPath} -c copy ${outputPath}`;
    console.log('starting local m3u8 to mp4 conversion....');
    return terminal(command);
  }

  async transcodeVideoByResolution(videoId: string, height: number, width: number) {
    let result = null;
    try {
      let inputFilePath = Utils.getLocalVideoMp4Path(videoId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      let outputFolderPath = Utils.getLocalResolutionPath(
        videoId,
        height,
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      );
      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      throw new Error(e);
    }

    return result;
  }

  async createMp4FromM3u8ByResolution(videoId: string, height: number) {
    let result = null;
    try {
      let masterPlaylistPath = `${Utils.getLocalResolutionPath(videoId, height, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY)}/${height}_out.m3u8`;
      let outputPath =
        Utils.getLocalVideoRootPath(videoId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY) + `/download.mp4`;
      result = await this.createMp4FromM3u8(masterPlaylistPath, outputPath);
    } catch (e: any) {
      throw new Error(e);
    }

    return result;
  }
}
