import { OnModuleInit } from '@nestjs/common';
import fs from 'node:fs';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import console from 'node:console';
import { Job } from 'bullmq';
import { Constants, Models, Utils } from 'video-touch-common';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { checkLastAttempt } from '@/src/common/utils';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UploadService } from '@/src/worker/upload.service';

@Processor(process.env.BULL_AUDIO_TRANSCRIPT_MERGE_QUEUE, {
  concurrency: 5,
})
export class TranscriptMergerWorker extends WorkerHost implements OnModuleInit {
  constructor(
    private fileStatusPublisher: FileStatusPublisher,
    private uploaderService: UploadService,
  ) {
    super();
  }
  onModuleInit() {
    console.log(`TranscriptMergerWorker initialized with queue:`, process.env.BULL_AUDIO_TRANSCRIPT_MERGE_QUEUE);
  }

  async process(job: Job): Promise<any> {
    console.log('TranscriptMergerWorker', job.data);
    let msg: Models.AudioTranscriptionMergeJobModel = job.data as Models.AudioTranscriptionMergeJobModel;
    let isLastAttempt = checkLastAttempt(job);
    try {
      this.fileStatusPublisher.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
          `Transcript merging started`,
        0,
        Constants.FILE_STATUS.PROCESSING,
      );

      await this.generateTranscript(msg.asset_id, msg.partial_transcript_files);
      console.log('transcript merged successfully');
      await this.uploaderService.publishVideoUploadJob(
        msg.file_id.toString(),
        msg.name,
        msg.asset_id,
        0,
        0,
        Constants.FILE_TYPE.TRANSCRIPT,
      );
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
  // Helper function to convert HH:MM:SS to seconds
  private timeToSeconds(time: string): number {
    const parts = time.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  // Helper function to convert seconds to HH:MM:SS
  private secondsToTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return [hours, minutes, secs].map((val) => String(val).padStart(2, '0')).join(':');
  }

  async generateTranscript(
    assetId: string,
    partialTranscriptFiles: { name: string; audio_start_time: string }[],
  ): Promise<string> {
    if (partialTranscriptFiles.length === 0) {
      throw new Error('No partial transcript files found for this asset');
    }
    console.log('partialTranscriptFiles ', partialTranscriptFiles.length);

    // Sort files by name to ensure correct order (e.g., transcript_0.json, transcript_1.json, etc.)
    partialTranscriptFiles.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    let finalTranscriptFilePath = Utils.getLocalTranscriptPath(
      assetId,
      AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
    );

    // Merge all partial transcripts into a single JSON array
    let mergedTranscripts: any[] = [];

    for (let file of partialTranscriptFiles) {
      let partialTranscriptPath = `${Utils.getLocalPartialTranscriptsDir(
        assetId,
        AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY,
      )}/${file.name}`;

      if (!fs.existsSync(partialTranscriptPath)) {
        console.warn(`Partial transcript file not found: ${partialTranscriptPath}`);
        continue;
      }

      let partialTranscriptContent = fs.readFileSync(partialTranscriptPath, 'utf-8');

      try {
        // Parse the JSON array from each partial transcript
        let partialData = JSON.parse(partialTranscriptContent);

        // Get the audio_start_time from file metadata (in HH:MM:SS format)
        const audioStartTime = file?.audio_start_time || '00:00:00';
        const audioStartSeconds = this.timeToSeconds(audioStartTime);

        // If it's an array, merge all elements with adjusted times
        if (Array.isArray(partialData)) {
          const adjustedData = partialData.map((segment) => ({
            ...segment,
            start: this.secondsToTime(this.timeToSeconds(segment.start) + audioStartSeconds),
            end: this.secondsToTime(this.timeToSeconds(segment.end) + audioStartSeconds),
          }));
          mergedTranscripts.push(...adjustedData);
        } else {
          // If it's a single object, adjust its times and push it
          mergedTranscripts.push({
            ...partialData,
            start: this.secondsToTime(this.timeToSeconds(partialData.start) + audioStartSeconds),
            end: this.secondsToTime(this.timeToSeconds(partialData.end) + audioStartSeconds),
          });
        }
      } catch (error) {
        console.error(`Error parsing partial transcript file ${file.name}:`, error);
        throw new Error(`Invalid JSON in partial transcript file: ${file.name}`);
      }
    }

    // Write the merged transcript to the final file
    fs.writeFileSync(finalTranscriptFilePath, JSON.stringify(mergedTranscripts, null, 2), 'utf-8');

    console.log(`Final transcript generated at: ${finalTranscriptFilePath}`);
    console.log(`Total transcript segments: ${mergedTranscripts.length}`);

    return finalTranscriptFilePath;
  }
}
