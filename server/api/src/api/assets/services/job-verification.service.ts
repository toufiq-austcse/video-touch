import { Injectable } from '@nestjs/common';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { Constants } from 'video-touch-common';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { Job } from 'bullmq/dist/esm/classes/job';

@Injectable()
export class JobVerificationService {
  constructor(private fileRepository: FileRepository, private jobManagerService: JobManagerService) {}

  /**
   * Verifies and republishes jobs for files with Processing and Queued status
   * @returns Object with counts of verified and republished jobs
   */
  async verifyAndRepublishJobs(): Promise<{
    verifiedCount: number;
    republishedCount: number;
  }> {
    let verifiedCount = 0;
    let republishedCount = 0;

    console.log('Starting job verification and republishing process');

    let files = await this.fileRepository.findFilesByStatuses([
      Constants.FILE_STATUS.PROCESSING,
      Constants.FILE_STATUS.QUEUED,
    ]);

    for (let file of files) {
      if (!file.job_id) {
        continue;
      }
      let newJob: Job<any, any, string> | null = null;
      if (file.type === Constants.FILE_TYPE.THUMBNAIL) {
        newJob = await this.verifyThumbnailGenerationJob(file);
      } else if (file.type === Constants.FILE_TYPE.SOURCE) {
        newJob = await this.verifySourceFileUploadJob(file);
      } else if (file.type === Constants.FILE_TYPE.PLAYLIST) {
        newJob = await this.verifyVideoProcessingJob(file);
      }
      if (newJob) {
        republishedCount++;
      }
      verifiedCount++;
    }

    return {
      verifiedCount,
      republishedCount,
    };
  }

  async verifyThumbnailGenerationJob(file: FileDocument): Promise<Job<any, any, string>> {
    let job = await this.jobManagerService.getThumbnailJobByJobId(file.job_id);
    if (job) {
      console.log(`Thumbnail generation job for file ${file._id} exists, no action needed.`);
      return null;
    }
    let newJob = await this.jobManagerService.publishThumbnailGenerationJob(file);
    await this.fileRepository.findOneAndUpdate(
      {
        _id: file._id,
      },
      {
        $set: {
          job_id: newJob.id,
          latest_status: Constants.FILE_STATUS.QUEUED,
        },
      }
    );
    return newJob;
  }

  private async verifySourceFileUploadJob(file: FileDocument): Promise<Job<any, any, string>> {
    let job = await this.jobManagerService.getUploadSourceFileJobByJobId(file.job_id);
    if (job) {
      console.log(`Source file upload job for file ${file._id} exists, no action needed.`);
      return null;
    }
    let newJob = await this.jobManagerService.publishSourceFileUploadJob(file);
    await this.fileRepository.findOneAndUpdate(
      {
        _id: file._id,
      },
      {
        $set: {
          job_id: newJob.id,
          latest_status: Constants.FILE_STATUS.QUEUED,
        },
      }
    );
    return newJob;
  }

  private async verifyVideoProcessingJob(file: FileDocument): Promise<Job<any, any, string>> {
    let job = await this.jobManagerService.getVideoProcessingJobByJobId(file.job_id, file.height);
    if (job) {
      console.log(`Video processing job for file ${file._id} exists, no action needed.`);
      return null;
    }
    let jobModel = this.jobManagerService.getJobData(file);
    let newJob = await this.jobManagerService.publishVideoProcessingJob(jobModel);
    await this.fileRepository.findOneAndUpdate(
      {
        _id: file._id,
      },
      {
        $set: {
          job_id: newJob.id,
          latest_status: Constants.FILE_STATUS.QUEUED,
        },
      }
    );
    return newJob;
  }
}
