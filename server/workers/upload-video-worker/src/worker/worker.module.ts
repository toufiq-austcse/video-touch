import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { AwsModule } from '@/src/common/aws/aws.module';
import { VideoUploaderJobHandler } from '@/src/worker/upload-video.worker';
import { BullModule } from '@nestjs/bullmq';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { BunnyModule } from '@/src/common/bunny/bunny.module';

@Module({
  imports: [
    AppConfigModule,
    RabbitMQModule,
    AwsModule,
    BunnyModule,
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
      inject: [AppConfigService],
      useFactory: () => ({
        name: AppConfigService.appConfig.BULL_UPLOAD_JOB_QUEUE,
      }),
    }),
  ],
  controllers: [],
  providers: [VideoUploaderJobHandler],
})
export class WorkerModule {}
