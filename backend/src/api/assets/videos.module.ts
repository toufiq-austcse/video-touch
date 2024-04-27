import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ASSET_COLLECTION_NAME, VideoSchema } from './schemas/assets.schema';
import { AssetRepository } from './repositories/asset.repository';
import { AssetService } from './services/asset.service';
import { AssetResolver } from './resolvers/asset.resolver';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';

import { ModuleRef } from '@nestjs/core';
import { FILE_STATUS, VIDEO_STATUS } from '@/src/common/constants';
import { VideoDownloadService } from '@/src/api/assets/services/video-download.service';
import { DownloadVideoJobHandler } from '@/src/api/assets/job-handler/download-video-job.handler';
import { VideoValidationJobHandler } from '@/src/api/assets/job-handler/video-validation-job.handler';
import { VideoProcessorJobHandler } from '@/src/api/assets/job-handler/video-processer-job.handler';
import { TranscodingService } from '@/src/api/assets/services/transcoding.service';
import { VideoUploaderJobHandler } from '@/src/api/assets/job-handler/video-uploader-job.handler';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FILE_COLLECTION_NAME, FileSchema } from '@/src/api/assets/schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FileService } from '@/src/api/assets/services/file.service';
import { ManifestService } from '@/src/api/assets/services/manifest.service';
import { getMainManifestFileName } from '@/src/common/utils';
import mongoose from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ASSET_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function() {
            console.log('assets pre save hook');
            const asset = this;
            (asset as any).master_file_name = getMainManifestFileName();
            (asset as any).latest_status = VIDEO_STATUS.QUEUED;
            (asset as any).status_logs = StatusMapper.mapForSave(VIDEO_STATUS.QUEUED, 'Video is queued');
          });
          schema.post('save', async function() {
            let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });
            console.log('post save hook');
            const video: any = this;

            assetService
              .pushDownloadVideoJob(video)
              .then(() => {
                console.log('pushed download assets job');
              })
              .catch((err) => {
                console.log('error pushing download assets job', err);
              });
            return;
          });

          schema.post('findOneAndUpdate', async function(doc) {
            console.log('update one called in assets ');

            let updatedAsset = await this.findOne({
              _id: mongoose.Types.ObjectId(doc._id)
            });
            if (updatedAsset.latest_status === VIDEO_STATUS.FAILED) {
              let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });
              assetService.deleteLocalAssetFile(updatedAsset._id);
            }
            return;
          });

          return schema;
        }
      },
      {
        name: FILE_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = FileSchema;
          schema.post('findOneAndUpdate', async function(doc) {
            let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });

            let updatedFile = await this.findOne({
              _id: mongoose.Types.ObjectId(doc._id)
            });
            let assetId = updatedFile.asset_id;

            if (updatedFile.latest_status == FILE_STATUS.READY) {

              await assetService
                .checkForDeleteLocalAssetFile(assetId)
                .then((data) => {
                  console.log('checked local video file');
                })
                .catch((err) => {
                  console.log('error while checking local file ', err);
                });
            }
            if (updatedFile.latest_status === FILE_STATUS.FAILED) {
              await assetService.checkForAssetFailedStatus(assetId);
            }
            return;
          });

          return schema;
        }
      }
    ])
  ],
  providers: [
    AssetRepository,
    FileRepository,
    AssetService,
    AssetResolver,
    AssetMapper,
    VideoDownloadService,
    FileService,
    TranscodingService,
    DownloadVideoJobHandler,
    VideoValidationJobHandler,
    VideoProcessorJobHandler,
    VideoUploaderJobHandler,
    JobManagerService,
    ManifestService
  ]
})
export class VideosModule {
}
