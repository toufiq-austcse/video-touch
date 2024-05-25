import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { ValidateVideoWorker } from '@/src/worker/validate-video.worker';


@Module({
  imports: [AppConfigModule, RabbitMQModule, HttpClientsModule],
  controllers: [],
  providers: [ValidateVideoWorker]
})
export class WorkerModule {
}
