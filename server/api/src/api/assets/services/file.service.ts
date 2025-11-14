import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { Constants } from 'video-touch-common';

@Injectable()
export class FileService {
  constructor(
    private repository: FileRepository,
    private assetService: AssetService,
    private jobManagerService: JobManagerService
  ) {}

  async updateFileStatus(fileId: string, status: string, details: string, size?: number) {
    let file = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(fileId),
    });
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }

    let updatedData: mongoose.UpdateQuery<FileDocument> = {
      latest_status: status,
      $push: {
        status_logs: {
          status: status,
          details: details,
        },
      },
    };
    if (size && file.type !== Constants.FILE_TYPE.SOURCE) {
      updatedData = {
        ...updatedData,
        size: size,
      };
    }

    return this.repository.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(fileId),
      },
      updatedData
    );
  }

  async afterUpdateFileLatestStatus(oldDoc: FileDocument) {
    console.log('oldDoc ', oldDoc);
    let updatedFile = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(oldDoc._id.toString()),
    });

    if (updatedFile.type === Constants.FILE_TYPE.AUDIO && updatedFile.latest_status === Constants.FILE_STATUS.READY) {
      this.checkForTranscriptionGeneration(updatedFile)
        .then()
        .catch((err) => {
          console.log('error while checking transcription generation', err);
        });
    }

    let assetId = updatedFile.asset_id;

    if (updatedFile.latest_status == Constants.FILE_STATUS.READY && updatedFile.type === Constants.FILE_TYPE.PLAYLIST) {
      this.checkDownloadFileGeneration(updatedFile)
        .then()
        .catch((err) => {
          console.log('error while checking download file generation', err);
        });

      this.assetService
        .checkForAssetReadyStatus(assetId.toString())
        .then(() => {
          console.log('checked for asset ready status');
        })
        .catch((err) => {
          console.log('error while checking asset ready status', err);
        });
      this.assetService
        .updateMasterFileVersion(assetId.toString())
        .then((data) => {
          console.log('updated master file version ', data);
        })
        .catch((err) => {
          console.log('error while updating master file version', err);
        });
    }

    if (updatedFile.latest_status === Constants.FILE_STATUS.FAILED) {
      this.assetService
        .checkForAssetFailedStatus(assetId.toString())
        .then()
        .catch((err) => {
          console.log('error while checking asset failed status', err);
        });
    }
  }

  async checkDownloadFileGeneration(updatedFile: FileDocument) {
    let downloadTypeFile = await this.getFileByType(
      updatedFile.asset_id.toString(),
      Constants.FILE_TYPE.DOWNLOAD,
      Constants.FILE_STATUS.QUEUED
    );
    if (!downloadTypeFile) {
      console.log('No download type file found, skipping download file generation');
      return;
    }
    if (downloadTypeFile.height !== updatedFile.height) {
      console.log('Download file height does not match updated file height, skipping download file generation');
      return;
    }
    return this.initDownloadFileGeneration(downloadTypeFile);
  }

  async initDownloadFileGeneration(downloadFile: FileDocument) {
    console.log('Download file found, proceeding with download file generation');
    let jobData = await this.jobManagerService.publishDownloadFileGenerationJob(downloadFile);
    console.log('job published for download file ', jobData);
    if (jobData) {
      await this.repository.findOneAndUpdate(
        {
          _id: downloadFile._id,
        },
        {
          job_id: jobData.id,
        }
      );
    }
  }

  async initTranscriptionFileGeneration(transcriptFile: FileDocument) {
    console.log('Transcript file found, proceeding with transcription generation');
    let jobData = await this.jobManagerService.publishTranscriptionGenerationJob(transcriptFile);
    console.log('job published for transcript file ', jobData);
    if (jobData) {
      await this.repository.findOneAndUpdate(
        {
          _id: transcriptFile._id,
        },
        {
          job_id: jobData.id,
        }
      );
    }
  }

  async afterSave(doc: FileDocument) {
    try {
      if (doc.type === Constants.FILE_TYPE.PLAYLIST) {
        console.log('file type is playlist, skipping further processing');
        let jobModel = this.jobManagerService.getJobData(doc);
        let jobData = await this.jobManagerService.publishVideoProcessingJob(jobModel);
        console.log('job published for playlist file ', jobData);
        if (jobData) {
          await this.repository.findOneAndUpdate(
            {
              _id: doc._id,
            },
            {
              job_id: jobData.id,
            }
          );
        }
      }
      if (doc.type === Constants.FILE_TYPE.THUMBNAIL) {
        let jobData = await this.jobManagerService.publishThumbnailGenerationJob(doc);
        if (jobData) {
          console.log('thumbnail generation job published for file ', jobData);
          await this.repository.findOneAndUpdate(
            {
              _id: doc._id,
            },
            {
              job_id: jobData.id,
            }
          );
        }
      }
      if (doc.type === Constants.FILE_TYPE.SOURCE) {
        console.log('file type is download, skipping further processing');
        let jobData = await this.jobManagerService.publishSourceFileUploadJob(doc);
        console.log('job published for download file ', jobData);
        if (jobData) {
          await this.repository.findOneAndUpdate(
            {
              _id: doc._id,
            },
            {
              job_id: jobData.id,
            }
          );
        }
      }
      if (doc.type === Constants.FILE_TYPE.AUDIO) {
        console.log('Audio file found, proceeding with audio file generation');
        let jobData = await this.jobManagerService.publishAudioFileGenerationJob(doc);
        console.log('job published for audio file ', jobData);
        if (jobData) {
          await this.repository.findOneAndUpdate(
            {
              _id: doc._id,
            },
            {
              job_id: jobData.id,
            }
          );
        }
      }
    } catch (err) {
      console.error('Error in afterSave for file service: ', err);
    }
  }

  async getFileByType(assetId: string, type: string, status: string): Promise<FileDocument | null> {
    return this.repository.findOne({
      asset_id: mongoose.Types.ObjectId(assetId),
      type: type,
      latest_status: status,
    });
  }

  async checkForTranscriptionGeneration(updatedFile: FileDocument) {
    let transcriptTypeFile = await this.getFileByType(
      updatedFile.asset_id.toString(),
      Constants.FILE_TYPE.TRANSCRIPT,
      Constants.FILE_STATUS.QUEUED
    );
    if (!transcriptTypeFile) {
      console.log('No transcript type file found, skipping transcription generation');
      return;
    }

    return this.initTranscriptionFileGeneration(transcriptTypeFile);
  }
}
