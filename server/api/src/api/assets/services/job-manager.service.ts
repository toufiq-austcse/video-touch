import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { HeightWidthMap } from '@/src/api/assets/models/file.model';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { Constants, Models } from 'video-touch-common';
import { JobMetadataModel } from 'video-touch-common/dist/models';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { minutesToMilliseconds } from '@/src/common/utils';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';

@Injectable()
export class JobManagerService {
  constructor(
    @InjectQueue('process_video_360p') private videoProcessQueue360p: Queue,
    @InjectQueue('process_video_480p') private videoProcessQueue480p: Queue,
    @InjectQueue('process_video_540p') private videoProcessQueue540p: Queue,
    @InjectQueue('process_video_720p') private videoProcessQueue720p: Queue,
    @InjectQueue('process_video_1080p') private videoProcessQueue1080p: Queue,
    @InjectQueue('thumbnail-generation') private thumbnailGenerationQueue: Queue,
    @InjectQueue('upload-video') private videoUploadQueue: Queue,
    @InjectQueue('validate-video') private validateVideoQueue: Queue,
    @InjectQueue('download-video') private downloadVideoQueue: Queue
  ) {}

  async getThumbnailJobByJobId(jobId: string): Promise<Models.ThumbnailGenerationJobModel | null> {
    const job = await this.thumbnailGenerationQueue.getJob(jobId);
    if (job) {
      return job.data as Models.ThumbnailGenerationJobModel;
    }
    return null;
  }

  async getUploadSourceFileJobByJobId(jobId: string): Promise<Models.VideoUploadJobModel | null> {
    const job = await this.videoUploadQueue.getJob(jobId);
    if (job) {
      return job.data as Models.VideoUploadJobModel;
    }
    return null;
  }

  async getVideoProcessingJobByJobId(jobId: string, height: number): Promise<JobMetadataModel | null> {
    let queue: Queue | null = null;
    switch (height) {
      case 1080:
        queue = this.videoProcessQueue1080p;
        break;
      case 360:
        queue = this.videoProcessQueue360p;
        break;
      case 480:
        queue = this.videoProcessQueue480p;
        break;
      case 540:
        queue = this.videoProcessQueue540p;
        break;
      case 720:
        queue = this.videoProcessQueue720p;
        break;
      default:
        return null;
    }
    const job = await queue.getJob(jobId);
    if (job) {
      return job.data as JobMetadataModel;
    }
    return null;
  }

  getHeightWidthMap(): HeightWidthMap[] {
    return [
      {
        height: 1080,
        width: 1920,
      },
      {
        height: 720,
        width: 1280,
      },
      {
        height: 480,
        width: 854,
      },
      {
        height: 360,
        width: 640,
      },
    ];
  }

  getHeightWiseQueueName(height: number) {
    switch (height) {
      case 1080:
        return AppConfigService.appConfig.BULL_1080P_PROCESS_VIDEO_JOB_QUEUE;
      case 720:
        return AppConfigService.appConfig.BULL_720P_PROCESS_VIDEO_JOB_QUEUE;
      case 540:
        return AppConfigService.appConfig.BULL_540P_PROCESS_VIDEO_JOB_QUEUE;
      case 480:
        return AppConfigService.appConfig.BULL_480P_PROCESS_VIDEO_JOB_QUEUE;
      case 360:
        return AppConfigService.appConfig.BULL_360P_PROCESS_VIDEO_JOB_QUEUE;
      default:
        return AppConfigService.appConfig.BULL_360P_PROCESS_VIDEO_JOB_QUEUE;
    }
  }

  getJobsData(assetId: string, files: FileDocument[]): Models.JobMetadataModel[] {
    let jobModels: Models.JobMetadataModel[] = [];
    for (let file of files) {
      jobModels.push({
        asset_id: assetId,
        file_id: file._id.toString(),
        height: file.height,
        width: file.width,
        processRoutingKey: this.getHeightWiseQueueName(file.height),
      });
    }
    return jobModels;
  }

  getJobData(file: FileDocument): Models.JobMetadataModel {
    return {
      asset_id: file.asset_id.toString(),
      file_id: file._id.toString(),
      height: file.height,
      width: file.width,
      processRoutingKey: this.getHeightWiseQueueName(file.height),
    };
  }

  getAllHeightWidthMapByHeight(height: number) {
    return this.getHeightWidthMap().filter((data) => data.height <= height);
  }

  getJobDataByHeight(height: number) {
    return this.getHeightWidthMap().find((data) => data.height === height);
  }

  async publishVideoProcessingJob(jobModel: JobMetadataModel) {
    console.log('publishing video processing job for ', jobModel.processRoutingKey, jobModel);
    if (jobModel.height === 360) {
      return this.videoProcessQueue360p.add(jobModel.processRoutingKey, jobModel, {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      });
    } else if (jobModel.height === 480) {
      return this.videoProcessQueue480p.add(jobModel.processRoutingKey, jobModel, {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      });
    } else if (jobModel.height === 540) {
      return this.videoProcessQueue540p.add(jobModel.processRoutingKey, jobModel, {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      });
    } else if (jobModel.height === 720) {
      return this.videoProcessQueue720p.add(jobModel.processRoutingKey, jobModel, {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      });
    } else if (jobModel.height === 1080) {
      return this.videoProcessQueue1080p.add(jobModel.processRoutingKey, jobModel, {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      });
    }
    return null;
  }

  publishThumbnailGenerationJob(file: FileDocument) {
    let thumbnailGenerationJob: Models.ThumbnailGenerationJobModel = {
      asset_id: file.asset_id.toString(),
      file_id: file._id.toString(),
    };
    return this.thumbnailGenerationQueue.add(
      AppConfigService.appConfig.BULL_THUMBNAIL_GENERATION_JOB_QUEUE,
      thumbnailGenerationJob,
      {
        jobId: uuidv4(),
        attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
        backoff: {
          type: 'fixed',
          delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
        },
      }
    );
  }

  async publishSourceFileUploadJob(file: FileDocument) {
    let uploadJob: Models.VideoUploadJobModel = {
      asset_id: file.asset_id.toString(),
      file_id: file._id.toString(),
      height: file.height,
      width: file.width,
      type: Constants.FILE_TYPE.SOURCE,
      name: file.name,
    };
    console.log('publishing source file upload job for ', uploadJob);
    return this.videoUploadQueue.add(AppConfigService.appConfig.BULL_UPLOAD_JOB_QUEUE, uploadJob, {
      jobId: uuidv4(),
      attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
      backoff: {
        type: 'fixed',
        delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
      },
    });
  }

  async pushValidateVideoJob(assetId: string) {
    let validateVideoJob = this.buildValidateVideoJob(assetId);
    return this.validateVideoQueue.add(AppConfigService.appConfig.BULL_VALIDATE_JOB_QUEUE, validateVideoJob);
  }

  private buildDownloadVideoJob(videoDocument: AssetDocument): Models.VideoDownloadJobModel {
    return {
      asset_id: videoDocument._id.toString(),
      source_url: videoDocument.source_url,
    };
  }

  async pushDownloadVideoJob(videoDocument: AssetDocument) {
    let downloadVideoJob = this.buildDownloadVideoJob(videoDocument);
    console.log('push download video job to ', AppConfigService.appConfig.BULL_DOWNLOAD_JOB_QUEUE);
    return this.downloadVideoQueue.add(AppConfigService.appConfig.BULL_DOWNLOAD_JOB_QUEUE, downloadVideoJob, {
      jobId: uuidv4(),
      attempts: AppConfigService.appConfig.RETRY_JOB_ATTEMPT_COUNT,
      backoff: {
        type: 'fixed',
        delay: minutesToMilliseconds(AppConfigService.appConfig.RETRY_JOB_BACKOFF_IN_MINUTE),
      },
    });
  }

  private buildValidateVideoJob(assetId: string): Models.VideoValidationJobModel {
    return {
      asset_id: assetId,
    };
  }
}
