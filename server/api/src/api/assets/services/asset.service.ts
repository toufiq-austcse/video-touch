import { Injectable } from '@nestjs/common';
import { CreateAssetFromUploadInputDto, CreateAssetInputDto } from '../dtos/create-asset-input.dto';
import { AssetDocument } from '../schemas/assets.schema';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import { ListAssetInputDto } from '@/src/api/assets/dtos/list-asset-input.dto';
import { GetAssetInputDto } from '@/src/api/assets/dtos/get-asset-input.dto';
import { UpdateAssetInputDto } from '@/src/api/assets/dtos/update-asset-input.dto';
import mongoose from 'mongoose';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FileMapper } from '@/src/api/assets/mapper/file.mapper';
import { Constants, Utils } from 'video-touch-common';
import { HeightWidthMap } from '@/src/api/assets/models/file.model';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { CleanupService } from '@/src/api/assets/services/cleanup.service';

@Injectable()
export class AssetService {
  constructor(
    private repository: AssetRepository,
    private fileRepository: FileRepository,
    private jobManagerService: JobManagerService,
    private cleanUpService: CleanupService
  ) {}

  async create(createVideoInput: CreateAssetInputDto, userDocument: UserDocument) {
    let assetDocument = AssetMapper.buildAssetDocumentForSaving(createVideoInput, userDocument);
    return this.repository.create(assetDocument);
  }

  async createAssetFromUploadReq(uploadAssetReqDto: CreateAssetFromUploadInputDto, userDocument: UserDocument) {
    let assetDocument = AssetMapper.buildAssetDocumentFromUploadReq(uploadAssetReqDto, userDocument);
    return this.repository.create(assetDocument);
  }

  async listVideos(listVideoInputDto: ListAssetInputDto, user: UserDocument) {
    return this.repository.getPaginatedVideos(
      listVideoInputDto.first,
      listVideoInputDto.after,
      listVideoInputDto.before,
      user
    );
  }

  async getAsset(getVideoInputDto: GetAssetInputDto, userDocument: UserDocument) {
    return this.repository.findOne({
      _id: getVideoInputDto._id,
      user_id: userDocument._id,
    });
  }

  async update(oldVideo: AssetDocument, updateVideoInput: UpdateAssetInputDto) {
    await this.repository.findOneAndUpdate(
      { _id: oldVideo._id },
      {
        title: updateVideoInput.title ? updateVideoInput.title : oldVideo.title,
        description: updateVideoInput.description ? updateVideoInput.description : updateVideoInput.description,
        tags: updateVideoInput.tags ? updateVideoInput.tags : oldVideo.tags,
      }
    );
    return this.repository.findOne({ _id: oldVideo._id });
  }

  async softDeleteVideo(currentVideo: AssetDocument) {
    await this.repository.findOneAndUpdate(
      { _id: currentVideo._id },
      {
        is_deleted: true,
      }
    );
    return this.repository.findOne({ _id: currentVideo._id });
  }

  async updateAssetStatus(videoId: string, status: string, details: string) {
    return this.repository.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(videoId),
        latest_status: {
          $ne: status,
        },
      },
      {
        latest_status: status,
        $push: {
          status_logs: {
            status: status,
            details: details,
          },
        },
      }
    );
  }

  async checkForDeleteLocalAssetFile(assetId: string) {
    console.log('checking for ', assetId);
    let files = await this.fileRepository.find({
      asset_id: mongoose.Types.ObjectId(assetId),
    });
    let filesWithReadyStatus = files.filter((file) => file.latest_status === Constants.FILE_STATUS.READY);

    console.log('length ', files.length, filesWithReadyStatus.length);
    if (files.length === filesWithReadyStatus.length) {
      this.cleanUpService.deleteLocalAssetFile(assetId);
    }
  }

  async checkForAssetFailedStatus(assetId: string) {
    try {
      let files = await this.fileRepository.find({
        asset_id: mongoose.Types.ObjectId(assetId),
        type: Constants.FILE_TYPE.PLAYLIST,
      });

      let failedFiles = files.filter((file) => file.latest_status === Constants.FILE_STATUS.FAILED);
      if (failedFiles.length === files.length) {
        console.log('all files failed');
        await this.updateAssetStatus(assetId, Constants.VIDEO_STATUS.FAILED, 'All files failed');
      }
    } catch (err) {
      console.log('error while checkForAssetFailedStatus ', err);
    }
  }

  async afterUpdateLatestStatus(oldDoc: AssetDocument) {
    let updatedAsset = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(oldDoc._id.toString()),
    });

    if (updatedAsset.latest_status === Constants.VIDEO_STATUS.FAILED) {
      this.cleanUpService.deleteLocalAssetFile(updatedAsset._id.toString());
    }
    if (
      updatedAsset.latest_status === Constants.VIDEO_STATUS.DOWNLOADED ||
      updatedAsset.latest_status === Constants.VIDEO_STATUS.UPLOADED
    ) {
      console.log('pushing validate assets job 1 ...');
      this.jobManagerService
        .pushValidateVideoJob(updatedAsset._id.toString())
        .then(() => {
          console.log('pushed validate assets job');
        })
        .catch((err) => {
          console.log('error pushing validate assets job', err);
          this.updateAssetStatus(
            updatedAsset._id.toString(),
            Constants.VIDEO_STATUS.FAILED,
            `Error pushing validate job. ${err.toString()}`
          );
        });
    }
    if (updatedAsset.latest_status === Constants.VIDEO_STATUS.VALIDATED) {
      let heightWidthMapByHeight = this.jobManagerService.getAllHeightWidthMapByHeight(updatedAsset.height);
      await this.insertManifestFilesData(updatedAsset._id.toString(), heightWidthMapByHeight);
      await this.createThumbnailFile(updatedAsset._id.toString(), updatedAsset.height, updatedAsset.width);
      await this.createSourceFile(
        updatedAsset._id.toString(),
        updatedAsset.height,
        updatedAsset.width,
        updatedAsset.size
      );
      await this.updateAssetStatus(updatedAsset._id.toString(), Constants.VIDEO_STATUS.PROCESSING, 'Video processing');
    }
  }

  async afterSave(doc: AssetDocument) {
    if (!doc.source_url) {
      console.log('source_url is not present, skipping download assets job');
      await this.updateAssetStatus(doc._id.toString(), Constants.VIDEO_STATUS.FAILED, 'source_url not present');
      return;
    }
    try {
      let job = await this.jobManagerService.pushDownloadVideoJob(doc);
      console.log('pushed download assets job', job.id);
      await this.updateAssetStatus(doc._id.toString(), Constants.VIDEO_STATUS.DOWNLOADING, 'Downloading assets');
      await this.repository.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(doc._id.toString()),
        },
        {
          job_id: job.id,
        }
      );
    } catch (e) {
      console.log('error pushing download assets job', e);
      await this.updateAssetStatus(
        doc._id.toString(),
        Constants.VIDEO_STATUS.FAILED,
        `Error pushing download job. ${e.toString()}`
      );
    }
  }

  async insertManifestFilesData(assetId: string, heightWidthMaps: HeightWidthMap[]) {
    let files: FileDocument[] = [];
    for (let data of heightWidthMaps) {
      let newFiles = await this.createPlaylistFileAfterValidation(assetId, data.height, data.width);
      files.push(newFiles);
    }
    return files;
  }

  async createPlaylistFileAfterValidation(assetId: string, height: number, width: number) {
    let name = Utils.getFileName(height);
    let doc = FileMapper.mapForSave(
      assetId,
      name,
      Constants.FILE_TYPE.PLAYLIST,
      height,
      width,
      Constants.FILE_STATUS.QUEUED,
      'File queued for processing'
    );
    return this.fileRepository.create(doc);
  }

  async checkForAssetReadyStatus(assetId: string) {
    let video = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(assetId),
    });

    if (!video) {
      throw new Error('video not found');
    }

    if (video.latest_status !== Constants.VIDEO_STATUS.READY) {
      await this.updateAssetStatus(assetId, Constants.VIDEO_STATUS.READY, 'Video ready');
    }
  }

  async updateMasterFileVersion(assetId: string) {
    let readyFileCount = await this.fileRepository.count({
      asset_id: mongoose.Types.ObjectId(assetId),
      type: Constants.FILE_TYPE.PLAYLIST,
      latest_status: Constants.FILE_STATUS.READY,
    });

    if (readyFileCount === 0) {
      return null;
    }

    let master_file_name = `${Utils.getMainManifestFileName()}?v=${readyFileCount}`;
    return this.repository.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(assetId),
      },
      {
        master_file_name: master_file_name,
      }
    );
  }

  async createThumbnailFile(assetId: string, height: number, width: number) {
    let thumbnailName = Utils.getThumbnailFileName();
    let fileToBeSaved = FileMapper.mapForSave(
      assetId,
      thumbnailName,
      Constants.FILE_TYPE.THUMBNAIL,
      height,
      width,
      Constants.FILE_STATUS.QUEUED,
      'Thumbnail queued for processing'
    );
    return this.fileRepository.create(fileToBeSaved);
  }

  async createSourceFile(assetId: string, height: number, width: number, size: number) {
    let sourceFileName = 'download.mp4';
    let fileToBeSaved = FileMapper.mapForSave(
      assetId,
      sourceFileName,
      Constants.FILE_TYPE.SOURCE,
      height,
      width,
      Constants.FILE_STATUS.QUEUED,
      'Source file queued for uploading',
      size
    );
    return this.fileRepository.create(fileToBeSaved);
  }
}
