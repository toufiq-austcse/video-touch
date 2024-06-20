import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { ThumbnailGenerationWorker } from '@/src/worker/thumbnail-generation.worker';


@Module({
  imports: [AppConfigModule, RabbitMQModule],
  controllers: [],
  providers: [ThumbnailGenerationWorker]
})
export class WorkerModule {
}
