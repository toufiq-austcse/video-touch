import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { ProcessVideoWorker } from '@/src/worker/process-video.worker';
import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMQModule } from '../common/rabbit-mq/rabbit-mq.module';
import { DownloadFileGenerationWorker } from '@/src/worker/download-file-generation.worker';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { UploadService } from '@/src/worker/upload.service';

@Module({
  imports: [
    AppConfigModule,
    RabbitMQModule,
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: () => ({
        connection: {
          host: AppConfigService.appConfig.REDIS_HOST,
          port: AppConfigService.appConfig.REDIS_PORT,
        },
      }),
    }),
    BullModule.registerQueueAsync(
      {
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_PROCESS_VIDEO_JOB_QUEUE,
        }),
      },
      {
        name: 'upload-video',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_UPLOAD_JOB_QUEUE,
        }),
      },
      {
        name: 'download-file-generation',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_DOWNLOAD_FILE_GENERATION_JOB_QUEUE,
        }),
      },
    ),
  ],
  controllers: [],
  providers: [
    ProcessVideoWorker,
    TranscodingService,
    ManifestService,
    DownloadFileGenerationWorker,
    FileStatusPublisher,
    UploadService,
  ],
})
export class WorkerModule {}
