import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as console from 'node:console';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Models, Utils } from 'video-touch-common';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { AudioExtractionService } from '@/src/worker/audio-extraction.service';
import { UploadService } from '@/src/worker/upload.service';
import { FILE_TYPE } from 'video-touch-common/dist/constants';

@Processor(process.env.BULL_AUDIO_EXTRACTION_JOB_QUEUE)
export class AudioExtractionWorker extends WorkerHost implements OnModuleInit {
  constructor(
    private fileStatusPublisher: FileStatusPublisher,
    private audioExtractionService: AudioExtractionService,
    private uploadService: UploadService,
  ) {
    super();
  }

  onModuleInit() {
    console.log('AudioExtractionWorker initialized with queue:', process.env.BULL_AUDIO_EXTRACTION_JOB_QUEUE);
  }

  async process(job: Job): Promise<any> {
    console.log('AudioExtractionWorker', job.data);
    let msg: Models.AudioExtractionJobModel = job.data as Models.AudioExtractionJobModel;
    let isLastAttempt = this.isLastAttempt(job);

    try {
      this.fileStatusPublisher.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Audio extraction started',
        0,
        Constants.FILE_STATUS.PROCESSING,
      );

      let inputFilePath = Utils.getLocalVideoMp4Path(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      let outputFolderPath = Utils.getLocalVideoRootPath(msg.asset_id, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
      await this.audioExtractionService.extractAudio(inputFilePath, outputFolderPath);
      console.log('audio extracted successfully');
      await this.uploadService.publishVideoUploadJob(
        msg.file_id.toString(),
        msg.name,
        msg.asset_id,
        0,
        0,
        FILE_TYPE.AUDIO,
      );
      console.log('audio upload job published');
    } catch (e: any) {
      console.log(`error while extracting ${msg.asset_id} audio`, e, isLastAttempt);

      if (isLastAttempt) {
        this.fileStatusPublisher.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          e.message,
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error while extracting audio of assetId ${msg.asset_id}p: ${e.message}`);
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

  buildAssetUpdateEventModel(assetId: string, status: string, details: string): Models.UpdateAssetStatusEventModel {
    return {
      asset_id: assetId,
      status: status,
      details: details,
    };
  }
}
