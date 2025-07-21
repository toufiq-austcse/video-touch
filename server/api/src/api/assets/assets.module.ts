import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ASSET_COLLECTION_NAME, VideoSchema } from './schemas/assets.schema';
import { AssetRepository } from './repositories/asset.repository';
import { AssetService } from './services/asset.service';
import { AssetResolver } from './resolvers/asset.resolver';
import { AssetMapper } from '@/src/api/assets/mapper/asset.mapper';
import { ModuleRef } from '@nestjs/core';
import { VideoDownloadService } from '@/src/api/assets/services/video-download.service';
import { JobManagerService } from '@/src/api/assets/services/job-manager.service';
import { CleanupService } from '@/src/api/assets/services/cleanup.service';
import { FILE_COLLECTION_NAME, FileSchema } from '@/src/api/assets/schemas/files.schema';
import { StatusMapper } from '@/src/api/assets/mapper/status.mapper';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { FileService } from '@/src/api/assets/services/file.service';
import { UploadController } from '@/src/api/assets/controllers/upload.controller';
import { TusService } from '@/src/api/assets/services/tus.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { UpdateAssetStatusEventConsumer } from '@/src/api/assets/consumers/update-asset-status-event.consumer';
import { UpdateAssetEventConsumer } from '@/src/api/assets/consumers/update-asset-event.consumer';
import { UpdateFileStatusEventConsumer } from '@/src/api/assets/consumers/update-file-status-event.consumer';
import { Constants, Utils } from 'video-touch-common';
import { AssetFilesResolver } from '@/src/api/assets/resolvers/asset-files.resolver';
import { thumbnailByAssetLoader } from '@/src/api/assets/data-loaders/thumbnail-by-asset.loader';
import { FilesByAssetLoader } from '@/src/api/assets/data-loaders/asset-files.loader';
import { BullModule } from '@nestjs/bullmq';
import { AssetController } from '@/src/api/assets/controllers/asset.controller';
import { AuthModule } from '@/src/api/auth/auth.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { CronjobController } from '@/src/api/assets/controllers/cronjob.controller';
import { JobVerificationService } from '@/src/api/assets/services/job-verification.service';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueueAsync(
      {
        name: 'process_video_360p',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_360P_PROCESS_VIDEO_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'process_video_480p',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_480P_PROCESS_VIDEO_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'process_video_540p',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_540P_PROCESS_VIDEO_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'process_video_720p',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_720P_PROCESS_VIDEO_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'process_video_1080p',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_1080P_PROCESS_VIDEO_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'validate-video',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_VALIDATE_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'download-video',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_DOWNLOAD_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'thumbnail-generation',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_THUMBNAIL_GENERATION_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
          },
        }),
      },
      {
        name: 'upload-video',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_UPLOAD_JOB_QUEUE,
          defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: true,
          },
        }),
      }
    ),
    BullBoardModule.forFeature({
      name: 'process_video_360p',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'process_video_480p',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'process_video_540p',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'process_video_720p',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'process_video_1080p',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'validate-video',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'download-video',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'thumbnail-generation',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'upload-video',
      adapter: BullMQAdapter,
    }),
    MongooseModule.forFeatureAsync([
      {
        name: ASSET_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function () {
            console.log('assets pre save hook');
            const asset = this;
            (asset as any).master_file_name = Utils.getMainManifestFileName();
            if ((asset as any).source_url) {
              console.log('source url found', (asset as any).source_url);
              (asset as any).latest_status = Constants.VIDEO_STATUS.QUEUED;
              (asset as any).status_logs = StatusMapper.mapForSave(Constants.VIDEO_STATUS.QUEUED, 'Video is queued');
            } else {
              (asset as any).latest_status = Constants.VIDEO_STATUS.UPLOAD_PENDING;
              (asset as any).status_logs = StatusMapper.mapForSave(
                Constants.VIDEO_STATUS.UPLOAD_PENDING,
                'Video is uploading'
              );
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
            if (!doc) {
              return;
            }
            let fileService = moduleRef.get<FileService>(FileService, { strict: false });

            if (this['_update']['$set']['latest_status']) {
              await fileService.afterUpdateFileLatestStatus(doc);
            }

            return;
          });
          schema.post('save', async function (doc) {
            let fileService: FileService = moduleRef.get<FileService>(FileService, { strict: false });
            console.log('file post save hook');
            await fileService.afterSave(doc);
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
  controllers: [UploadController, AssetController, CronjobController],
  providers: [
    AssetRepository,
    FileRepository,
    AssetService,
    AssetResolver,
    AssetFilesResolver,
    AssetMapper,
    VideoDownloadService,
    FileService,
    UpdateAssetStatusEventConsumer,
    UpdateAssetEventConsumer,
    UpdateFileStatusEventConsumer,
    JobManagerService,
    TusService,
    thumbnailByAssetLoader,
    FilesByAssetLoader,
    CleanupService,
    JobVerificationService,
  ],
})
export class AssetsModule {}
