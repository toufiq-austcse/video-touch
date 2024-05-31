import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { ValidateVideoWorker } from '@/src/worker/validate-video.worker';


@Module({
  imports: [AppConfigModule, RabbitMQModule],
  controllers: [],
  providers: [ValidateVideoWorker]
})
export class WorkerModule {
}
