import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { AudioExtractionService } from '@/src/worker/audio-extraction.service';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { RabbitMQModule } from '../common/rabbit-mq/rabbit-mq.module';
import { FileStatusPublisher } from '@/src/worker/file-status.publisher';
import { UploadService } from '@/src/worker/upload.service';
import { AudioExtractionWorker } from '@/src/worker/audio-extraction.worker';
import { AudioTranscriptionWorker } from '@/src/worker/audio-transcription.worker';

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
          name: AppConfigService.appConfig.BULL_AUDIO_EXTRACTION_JOB_QUEUE,
        }),
      },
      {
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE,
        }),
      },
      {
        name: 'upload-video',
        inject: [AppConfigService],
        useFactory: () => ({
          name: AppConfigService.appConfig.BULL_UPLOAD_JOB_QUEUE,
        }),
      },
    ),
  ],
  controllers: [],
  providers: [
    AudioExtractionService,
    AudioExtractionWorker,
    AudioTranscriptionWorker,
    FileStatusPublisher,
    UploadService,
  ],
})
export class WorkerModule {}
