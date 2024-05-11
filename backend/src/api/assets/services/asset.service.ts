import { Injectable } from '@nestjs/common';
import { CreateAssetInputDto } from '../dtos/create-asset-input.dto';
import { AssetDocument } from '../schemas/assets.schema';
import { terminal } from '@/src/common/utils/terminal';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import { ListAssetInputDto } from '@/src/api/assets/dtos/list-asset-input.dto';
import { GetAssetInputDto } from '@/src/api/assets/dtos/get-asset-input.dto';
import { UpdateAssetInputDto } from '@/src/api/assets/dtos/update-asset-input.dto';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { VideoDownloadJobModel } from '@/src/api/assets/models/job.model';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import mongoose from 'mongoose';
import fs from 'fs';
import { getLocalVideoRootPath } from '@/src/common/utils';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FILE_STATUS, VIDEO_STATUS } from '@/src/common/constants';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { UploadAssetReqDto } from '@/src/api/assets/dtos/upload-asset-req.dto';

@Injectable()
export class AssetService {
  constructor(
    private repository: AssetRepository,
    private rabbitMqService: RabbitMqService,
    private fileRepository: FileRepository,
    private assetMapper: AssetMapper
  ) {
  }

  async create(createVideoInput: CreateAssetInputDto) {
    let assetDocument = this.assetMapper.buildAssetDocumentForSaving(createVideoInput);
    return this.repository.create(assetDocument);
  }

  async createAssetFromUploadReq(uploadAssetReqDto: UploadAssetReqDto) {
    let assetDocument=this.assetMapper.
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
      duration: +videoInfo.duration
    };
  }

  async listVideos(listVideoInputDto: ListAssetInputDto) {
    return this.repository.getPaginatedVideos(
      listVideoInputDto.first,
      listVideoInputDto.after,
      listVideoInputDto.before
    );
  }

  async getAsset(getVideoInputDto: GetAssetInputDto) {
    return this.repository.findOne({
      _id: getVideoInputDto._id
    });
  }

  async update(oldVideo: AssetDocument, updateVideoInput: UpdateAssetInputDto) {
    await this.repository.findOneAndUpdate(
      { _id: oldVideo._id },
      {
        title: updateVideoInput.title ? updateVideoInput.title : oldVideo.title,
        description: updateVideoInput.description ? updateVideoInput.description : updateVideoInput.description,
        tags: updateVideoInput.tags ? updateVideoInput.tags : oldVideo.tags
      }
    );
    return this.repository.findOne({ _id: oldVideo._id });
  }

  async softDeleteVideo(currentVideo: AssetDocument) {
    await this.repository.findOneAndUpdate(
      { _id: currentVideo._id },
      {
        is_deleted: true
      }
    );
    return this.repository.findOne({ _id: currentVideo._id });
  }

  async updateAssetStatus(videoId: string, status: string, details: string) {
    return this.repository.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(videoId),
        latest_status: {
          $ne: status
        }
      },
      {
        latest_status: status,
        $push: {
          status_logs: {
            status: status,
            details: details
          }
        }
      }
    );
  }

  async pushDownloadVideoJob(videoDocument: AssetDocument) {
    let downloadVideoJob = this.buildDownloadVideoJob(videoDocument);
    return this.rabbitMqService.publish(
      AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
      AppConfigService.appConfig.RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY,
      downloadVideoJob
    );
  }

  private buildDownloadVideoJob(videoDocument: AssetDocument): VideoDownloadJobModel {
    return {
      _id: videoDocument._id.toString(),
      source_url: videoDocument.source_url
    };
  }

  deleteLocalAssetFile(_id: string) {
    console.log('deleting local asset file ', _id);
    let localPath = getLocalVideoRootPath(_id);
    console.log('local path ', localPath);
    if (fs.existsSync(localPath)) {
      fs.rmSync(localPath, { recursive: true, force: true });
    }
  }

  async checkForDeleteLocalAssetFile(assetId: string) {
    console.log('checking for ', assetId);
    let files = await this.fileRepository.find({
      asset_id: mongoose.Types.ObjectId(assetId)
    });
    let filesWithReadyStatus = files.filter((file) => file.latest_status === FILE_STATUS.READY);
    if (files.length === filesWithReadyStatus.length) {
      this.deleteLocalAssetFile(assetId);
    }
  }

  async checkForAssetFailedStatus(assetId: string) {
    try {
      let notFailedFilesCount = await this.fileRepository.count({
        asset_id: mongoose.Types.ObjectId(assetId),
        latest_status: {
          $ne: FILE_STATUS.FAILED
        }
      });

      if (notFailedFilesCount > 0) {
        return;
      }

      let files = await this.fileRepository.find({
        asset_id: mongoose.Types.ObjectId(assetId)
      });

      let failedFiles = files.filter((file) => file.latest_status === FILE_STATUS.FAILED);
      if (failedFiles.length === files.length) {
        console.log('all files failed');
        await this.updateAssetStatus(assetId, VIDEO_STATUS.FAILED, 'All files failed');
      }
    } catch (err) {
      console.log('error while checkForAssetFailedStatus ', err);
    }
  }

  async afterUpdate(oldDoc: AssetDocument) {
    let updatedAsset = await this.repository.findOne({
      _id: mongoose.Types.ObjectId(oldDoc._id.toString())
    });

    console.log('updatedAsset ', updatedAsset);

    if (updatedAsset.latest_status === VIDEO_STATUS.FAILED) {
      this.deleteLocalAssetFile(updatedAsset._id.toString());
    }
  }

  async afterSave(doc: AssetDocument) {
    this.pushDownloadVideoJob(doc)
      .then(() => {
        console.log('pushed download assets job');
      })
      .catch((err) => {
        console.log('error pushing download assets job', err);
      });
  }
}
