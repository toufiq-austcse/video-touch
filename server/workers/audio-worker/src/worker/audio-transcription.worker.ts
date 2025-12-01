import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, terminal, Utils } from 'video-touch-common';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { GeminiClientService } from '@/src/common/gen-ai-models/gemini/gemini-client.service';
import { GEN_AI_PLATFORM } from '@/src/common/utils';
import { OpenAiClientService } from '@/src/common/gen-ai-models/open-ai/open-ai-client.service';
import * as fs from 'node:fs';

@Processor(process.env.BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE, {
  concurrency: 5,
})
export class AudioTranscriptionWorker extends WorkerHost implements OnModuleInit {
  constructor(
    private fileStatusPublisher: FileStatusPublisher,
    private gemniClientService: GeminiClientService,
    private openAiClientService: OpenAiClientService,
  ) {
    super();
  }

  onModuleInit() {
    console.log('AudioTranscriptionWorker initialized with queue:', process.env.BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE);
  }

  async process(job: Job): Promise<any> {
    console.log('AudioTranscriptionWorker', job.data);
    let msg: Models.AudioTranscriptionJobModel = job.data as Models.AudioTranscriptionJobModel;
    let isLastAttempt = this.isLastAttempt(job);

    try {
      this.fileStatusPublisher.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Audio transcription started',
        0,
        Constants.FILE_STATUS.PROCESSING,
      );

      let inputFilePath = `${Utils.getLocalVideoRootPath(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY)}/audio_chunks/${job.data.audio_file_name}`;
      let outputJsonPath = `${Utils.getLocalVideoRootPath(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY)}/transcripts`;
      let audioStartTime = job.data.audio_start_time || '00:00:00';

      if (!fs.existsSync(outputJsonPath)) {
        fs.mkdirSync(outputJsonPath, { recursive: true });
        console.log(`Created directory for transcript output at ${outputJsonPath}`);
      }
      await this.transcribeAudio(inputFilePath, `${outputJsonPath}/${job.data.name}`, audioStartTime);
      this.fileStatusPublisher.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Audio transcription completed',
        0,
        Constants.FILE_STATUS.READY,
      );
      console.log('audio transcribed successfully');
    } catch (e: any) {
      console.log(`error while transcribing ${msg.asset_id} audio`, e, isLastAttempt);

      if (isLastAttempt) {
        this.fileStatusPublisher.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          e.message,
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error while transcribing audio of assetId ${msg.asset_id}p: ${e.message}`);
    }
  }

  async transcribeAudio(inputFilePath: string, outputJsonlPath: string, audioStartTime: string) {
    let genAIPlatform = this.getGenAIPlatform();
    switch (genAIPlatform) {
      case GEN_AI_PLATFORM.GOOGLE_GENAI:
        console.log('Using Gemini for audio transcription');
        await this.gemniClientService.transcribeAudio(inputFilePath, outputJsonlPath);
        break;
      case GEN_AI_PLATFORM.OPENAI:
        console.log('Using OpenAI for audio transcription');
        await this.openAiClientService.transcribeAudio(inputFilePath, outputJsonlPath);
        break;
      default:
        throw new Error('No GenAI platform configured for audio transcription');
    }
  }

  isLastAttempt(job: Job): boolean {
    console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

    // Check if the job has been retried more than the maximum allowed attempts
    if (job.attemptsMade + 1 >= job.opts.attempts) {
      console.log(`Job ${job.id} has reached the maximum retry limit.`);
      return true; // This is the last attempt
    }
    return false; // There are more attempts left
  }

  private getGenAIPlatform(): string {
    if (AppConfigService.appConfig.GOOGLE_GENAI_API_KEY) {
      return GEN_AI_PLATFORM.GOOGLE_GENAI;
    }
    if (AppConfigService.appConfig.OPENAI_API_KEY) {
      return GEN_AI_PLATFORM.OPENAI;
    }
    return null;
  }

  async splitAudio(inputFilePath: string, outputDir: string) {
    // This method can be implemented to split audio files if needed
    // For now, it's just a placeholder
    console.log(`Splitting audio file ${inputFilePath} into directory ${outputDir}`);
    const command = `ffmpeg -i ${inputFilePath} -f segment -segment_time 300 -c copy ${outputDir}%03d.mp3`;
    await terminal(command);
    console.log('Audio splitting completed');
  }
}
