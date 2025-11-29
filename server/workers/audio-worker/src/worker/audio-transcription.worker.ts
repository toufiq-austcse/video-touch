import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as console from 'node:console';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, Utils } from 'video-touch-common';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { UploadService } from '@/src/worker/upload.service';
import { FILE_TYPE } from 'video-touch-common/dist/constants';
import { GeminiClientService } from '@/src/common/gen-ai-models/gemini/gemini-client.service';

@Processor(process.env.BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE)
export class AudioTranscriptionWorker extends WorkerHost implements OnModuleInit {
  constructor(
    private fileStatusPublisher: FileStatusPublisher,
    private uploadService: UploadService,
    // private gemniClientService: GeminiClientService,
    private openAiClientService: GeminiClientService,
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

      let inputFilePath = Utils.getLocalMp3Path(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      const tempJsonlPath = Utils.getLocalTranscriptPath(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      // await this.gemniClientService.transcribeAudio(inputFilePath, tempJsonlPath);
      await this.openAiClientService.transcribeAudio(inputFilePath, tempJsonlPath);
      console.log('audio transcribed successfully');
      await this.uploadService.publishVideoUploadJob(
        msg.file_id.toString(),
        msg.name,
        msg.asset_id,
        0,
        0,
        FILE_TYPE.TRANSCRIPT,
      );
      console.log('audio transcript upload job published');
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

  isLastAttempt(job: Job): boolean {
    console.log(`Job ${job.id} attempts made: ${job.attemptsMade}, max attempts: ${job.opts.attempts}`);

    // Check if the job has been retried more than the maximum allowed attempts
    if (job.attemptsMade + 1 >= job.opts.attempts) {
      console.log(`Job ${job.id} has reached the maximum retry limit.`);
      return true; // This is the last attempt
    }
    return false; // There are more attempts left
  }
}
