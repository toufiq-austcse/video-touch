import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ASSET_COLLECTION_NAME, VideoSchema } from './schemas/assets.schema';
import { AssetRepository } from './repositories/asset.repository';
import { AssetService } from './services/asset.service';
import { AssetResolver } from './resolvers/asset.resolver';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { ModuleRef } from '@nestjs/core';
import { VIDEO_STATUS } from '@/src/common/constants';
import { VideoDownloadService } from '@/src/api/assets/services/video-download.service';
import { TranscodingService } from '../../../../workers/process-video-worker/src/worker/transcoding.service';
import { VideoUploaderJobHandler } from '@/src/api/assets/job-handler/video-uploader-job.handler';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { FILE_COLLECTION_NAME, FileSchema } from '@/src/api/assets/schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FileService } from '@/src/api/assets/services/file.service';
import { ManifestService } from '../../../../workers/process-video-worker/src/worker/manifest.service';
import { getMainManifestFileName } from '@/src/common/utils';
import { UploadController } from '@/src/api/assets/controllers/upload.controller';
import { TusService } from '@/src/api/assets/services/tus.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UpdateAssetStatusEventConsumer } from '@/src/api/assets/consumers/update-asset-status-event.consumer';
import { UpdateAssetEventConsumer } from '@/src/api/assets/consumers/update-asset-event.consumer';
import { UpdateFileStatusEventConsumer } from '@/src/api/assets/consumers/update-file-status-event.consumer';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ASSET_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function () {
            console.log('assets pre save hook');
            const asset = this;
            (asset as any).master_file_name = getMainManifestFileName();
            if ((asset as any).source_url) {
              console.log('source url found', (asset as any).source_url);
              (asset as any).latest_status = VIDEO_STATUS.QUEUED;
              (asset as any).status_logs = StatusMapper.mapForSave(VIDEO_STATUS.QUEUED, 'Video is queued');
            } else {
              (asset as any).latest_status = VIDEO_STATUS.UPLOAD_PENDING;
              (asset as any).status_logs = StatusMapper.mapForSave(VIDEO_STATUS.UPLOAD_PENDING, 'Video is uploading');
            }
          });
          schema.post('save', async function (doc) {
            let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });
            console.log('post save hook');
            await assetService.afterSave(doc);
            return;
          });

          schema.post('findOneAndUpdate', async function (doc) {
            console.log('this ', this['_update']);
            if (!doc) {
              return;
            }

            let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });
            if (this['_update']['$set']['latest_status']) {
              await assetService.afterUpdateLatestStatus(doc);
            }

            return;
          });

          return schema;
        },
      },
      {
        name: FILE_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = FileSchema;
          schema.post('findOneAndUpdate', async function (doc) {
            let fileService = moduleRef.get<FileService>(FileService, { strict: false });
            await fileService.afterUpdate(doc);
            return;
          });

          return schema;
        },
      },
    ]),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [
    AssetRepository,
    FileRepository,
    AssetService,
    AssetResolver,
    AssetMapper,
    VideoDownloadService,
    FileService,
    TranscodingService,
    VideoUploaderJobHandler,
    UpdateAssetStatusEventConsumer,
    UpdateAssetEventConsumer,
    UpdateFileStatusEventConsumer,
    JobManagerService,
    ManifestService,
    TusService,
  ],
})
export class AssetsModule {}
