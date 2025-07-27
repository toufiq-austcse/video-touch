import { Injectable } from '@nestjs/common';
import { Constants, Utils } from 'video-touch-common';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import mongoose from 'mongoose';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import fs from 'fs';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FILE_STATUS } from 'video-touch-common/dist/constants';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';

@Injectable()
export class FileService {
  constructor(
    private repository: FileRepository,
    private assetService: AssetService,
    private jobManagerService: JobManagerService,
    private s3ClientService: S3ClientService
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
    if (updatedFile.type === Constants.FILE_TYPE.THUMBNAIL || updatedFile.type === Constants.FILE_TYPE.SOURCE) {
      return;
    }
    let assetId = updatedFile.asset_id;

    if (updatedFile.latest_status == Constants.FILE_STATUS.READY) {
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

  async listThumbnailFiles(items: AssetDocument[]): Promise<FileDocument[]> {
    let assetIds = items.map((item) => item._id);
    return this.repository.find({
      asset_id: { $in: assetIds },
      latest_status: Constants.FILE_STATUS.READY,
      type: Constants.FILE_TYPE.THUMBNAIL,
    });
  }

  async getThumbnailFile(assetId: string) {
    return this.repository.findOne({
      asset_id: mongoose.Types.ObjectId(assetId),
      latest_status: Constants.FILE_STATUS.READY,
      type: Constants.FILE_TYPE.THUMBNAIL,
    });
  }

  deleteLocalFile(assetId: string, resolution: string) {
    console.log('delete local file called ', assetId, ' resolution ', resolution);
    let localPath = `${Utils.getLocalVideoRootPath(
      assetId,
      AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY
    )}/${resolution}`;
    console.log('local path ', localPath);
    if (fs.existsSync(localPath)) {
      fs.rmSync(localPath, { recursive: true, force: true });
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

  async getSourceFileUrlToReProcess(currentAsset: AssetDocument): Promise<string> {
    let sourceFileUrl = currentAsset.source_url;

    let sourceFile = await this.getFileByType(
      currentAsset._id.toString(),
      Constants.FILE_TYPE.SOURCE,
      FILE_STATUS.READY
    );
    if (!sourceFile) {
      return sourceFileUrl;
    }
    let path = Utils.getS3SourceFileVideoPath(currentAsset._id.toString(), sourceFile.name);
    return this.s3ClientService.generateSignedUrlToGetObject(AppConfigService.appConfig.AWS_S3_BUCKET_NAME, path);
  }
}
