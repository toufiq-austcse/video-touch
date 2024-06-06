import { Injectable } from '@nestjs/common';
import { terminal } from '@/src/common/utils/terminal';
import { getLocalResolutionPath, getLocalVideoMp4Path } from '@/src/common/utils';


@Injectable()
export class TranscodingService {
  constructor() {
  }

  async transcodeVideo(inputFilePath: string, outputFolderPath: string, height: number, width: number) {
    let command = `ffmpeg -i ${inputFilePath} -profile:v baseline -level 3.0 -s ${width}x${height} -start_number 0 -hls_time 10 -hls_list_size 0 -f hls ${outputFolderPath}/${height}_out.m3u8`;
    console.log('starting transcoding.... ', height);
    return terminal(command);
  }

  async transcodeVideoByResolution(videoId: string, height: number, width: number) {
    let result = null;
    try {
      let inputFilePath = getLocalVideoMp4Path(videoId);
      let outputFolderPath = getLocalResolutionPath(videoId, height);
      result = await this.transcodeVideo(inputFilePath, outputFolderPath, height, width);
    } catch (e: any) {
      throw new Error(e);
    }

    return result;
  }
}
