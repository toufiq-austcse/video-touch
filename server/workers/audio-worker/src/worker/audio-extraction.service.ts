import { Injectable } from '@nestjs/common';
import { terminal } from 'video-touch-common';

@Injectable()
export class AudioExtractionService {
  constructor() {}

  async extractAudio(inputFilePath: string, outputFolderPath: string) {
    // Output file path (e\.g\. audio.m4a)
    const outputAudioPath = `${outputFolderPath}/audio.m4a`;
    // ffmpeg command for minimal size: mono channel, low bitrate
    const command = `ffmpeg -y -i ${inputFilePath} -vn -ar 44100 -ac 1 -b:a 64k ${outputAudioPath.replace('.m4a', '.mp3')}`;
    console.log('Extracting audio with minimal size...');
    return terminal(command);
  }
}
