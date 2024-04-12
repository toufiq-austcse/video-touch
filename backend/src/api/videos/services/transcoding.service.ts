import { Injectable } from '@nestjs/common';
import { terminal } from '@/src/common/utils/terminal';
import { getLocalResolutionPath, getLocalVideoMp4Path } from '@/src/common/utils';
import { VideoService } from '@/src/api/videos/services/video.service';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class TranscodingService {
  constructor(private videoServie: VideoService) {
  }

  async transcodeVideo(inputFilePath: string, outputFolderPath: string, height: number, width: number) {
    let command = `ffmpeg -i ${inputFilePath} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFolderPath}/${height}_out.m3u8`;
    console.log('starting transcoding.... ', height);
    return terminal(command);
  }

  async transcode360pVideo(videoId: string) {
    let result = null;
    try {
      let height = 360;
      let width = 640;
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;

  }

  async transcode480pVideo(videoId: string) {
    let result = null;
    try {
      let height = 480;
      let width = 854;
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;

  }

  async transcode540pVideo(videoId: string) {
    let result = null;
    try {
      let height = 540;
      let width = 960;
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;

  }

  async transcode720pVideo(videoId: string) {
    let result = null;
    try {
      let height = 720;
      let width = 1280;
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;

  }

  async transcode1080pVideo(videoId: string) {
    let result = null;
    try {
      let height = 1080;
      let width = 1920;
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;

  }
}