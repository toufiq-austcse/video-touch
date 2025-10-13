import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';
import { Constants, Models, terminal } from 'video-touch-common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { checkIsLastAttempt } from '@/src/common/utils';
import { UploadService } from '@/src/worker/upload.service';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';

@Processor(process.env.BULL_PROCESS_VIDEO_JOB_QUEUE, { lockDuration: 1000 * 60 * 60 * 1 }) // 2 hours lock duration
export class ProcessVideoWorker extends WorkerHost {
  constructor(
    private transcodingService: TranscodingService,
    private manifestService: ManifestService,
    private uploadService: UploadService,
    private fileStatusPublisher: FileStatusPublisher,
  ) {
    super();
    console.log('ProcessVideoWorker initialized');
  }

  async process(job: Job): Promise<any> {
    let msg: Models.VideoProcessingJobModel = job.data as Models.VideoProcessingJobModel;
    console.log('VideoProcessingJobHandler', msg);
    let isLastAttempt = checkIsLastAttempt(job);

    let { height, width } = msg;
    await this.processVideo(msg, height, width, isLastAttempt);
  }

  async processVideo(msg: Models.VideoProcessingJobModel, height: number, width: number, isLastAttempt: boolean) {
    try {
      this.fileStatusPublisher.publishUpdateFileStatusEvent(
        msg.file_id.toString(),
        'Video transcoding started',
        0,
        Constants.FILE_STATUS.PROCESSING,
      );
      if (msg.type === Constants.FILE_TYPE.PLAYLIST) {
        let res = await this.transcodingService.transcodeVideoByResolution(msg.asset_id.toString(), height, width);
        console.log(`video ${height}p transcode:`, res);
        this.manifestService.appendManifest(msg.asset_id.toString(), height);

        await this.uploadService.publishVideoUploadJob(
          msg.file_id.toString(),
          msg.name,
          msg.asset_id,
          height,
          width,
          msg.type,
        );
      }
      if (msg.type === Constants.FILE_TYPE.DOWNLOAD) {
        let res = await this.transcodingService.createMp4FromM3u8ByResolution(
          msg.asset_id.toString(),
          height,
          msg.name,
        );
        console.log(`video ${height}p download:`, res);
        await this.uploadService.publishVideoUploadJob(msg.file_id, msg.name, msg.asset_id, height, width, msg.type);
      }
    } catch (e: any) {
      console.log(`error while processing ${height}p`, e, isLastAttempt);

      if (isLastAttempt) {
        this.fileStatusPublisher.publishUpdateFileStatusEvent(
          msg.file_id.toString(),
          e.message,
          0,
          Constants.FILE_STATUS.FAILED,
        );
        return;
      }
      throw new Error(`Error while processing video at ${height}p: ${e.message}`);
    }
  }

  async getMetadata(url: string): Promise<{
    file_name: string;
    size: number;
    height: number;
    width: number;
    duration: number;
  }> {
    let extractMetaCommand = `ffprobe -v quiet -show_streams -show_format -print_format json ${url}`;
    let showStreamCommandRes = await terminal(extractMetaCommand);
    let parsedData = JSON.parse(showStreamCommandRes);
    let videoInfo = parsedData.streams[0];
    let format = parsedData.format;

    return {
      file_name: format.filename,
      size: +format.size,
      height: videoInfo.height,
      width: videoInfo.width,
      duration: +videoInfo.duration,
    };
  }
}
