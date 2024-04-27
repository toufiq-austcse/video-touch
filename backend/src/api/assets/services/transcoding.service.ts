import { Injectable } from '@nestjs/common';
import { terminal } from '@/src/common/utils/terminal';
import { getLocalResolutionPath, getLocalVideoMp4Path } from '@/src/common/utils';
import { VIDEO_RESOLUTION, VIDEO_STATUS } from '@/src/common/constants';
import { AssetService } from '@/src/api/assets/services/asset.service';

@Injectable()
export class TranscodingService {
  constructor(private assetService: AssetService) {}

  async transcodeVideo(inputFilePath: string, outputFolderPath: string, height: number, width: number) {
    let command = `ffmpeg -i ${inputFilePath} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFolderPath}/${height}_out.m3u8`;
    console.log('starting transcoding.... ', height);
    return terminal(command);
  }

  async transcode360pVideo(videoId: string) {
    let result = null;
    try {
      let { height, width } = VIDEO_RESOLUTION['360p'];
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        await this.assetService.updateAssetStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;
  }

  async transcode480pVideo(videoId: string) {
    let result = null;
    try {
      let { height, width } = VIDEO_RESOLUTION['480p'];
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        //  await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;
  }

  async transcode540pVideo(videoId: string) {
    let result = null;
    try {
      let { height, width } = VIDEO_RESOLUTION['540p'];
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        //  await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;
  }

  async transcode720pVideo(videoId: string) {
    let result = null;
    try {
      let { height, width } = VIDEO_RESOLUTION['720p'];
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        //  await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;
  }

  async transcode1080pVideo(videoId: string) {
    let result = null;
    try {
      let { height, width } = VIDEO_RESOLUTION['1080p'];
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);

      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      try {
        //await this.videoServie.insertVideoStatus(videoId, VIDEO_STATUS.FAILED, e.message);
      } catch (e) {
        console.log('Error inserting video status', e);
      }
    }

    return result;
  }
}
