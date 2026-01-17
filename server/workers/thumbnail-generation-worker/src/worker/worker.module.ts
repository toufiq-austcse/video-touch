import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { ThumbnailGenerationWorker } from '@/src/worker/thumbnail-generation.worker';
import { AwsModule } from '@/src/common/aws/aws.module';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { BunnyModule } from '@/src/common/bunny/bunny.module';

@Module({
  imports: [
    AppConfigModule,
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: () => ({
        connection: {
          host: AppConfigService.appConfig.REDIS_HOST,
          port: AppConfigService.appConfig.REDIS_PORT,
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'thumbnail-generation',
      inject: [AppConfigService],
      useFactory: () => ({
        name: AppConfigService.appConfig.BULL_THUMBNAIL_GENERATION_JOB_QUEUE,
      }),
    }),
    RabbitMQModule,
    BunnyModule,
    AwsModule,
  ],
  controllers: [],
  providers: [ThumbnailGenerationWorker],
})
export class WorkerModule {}
