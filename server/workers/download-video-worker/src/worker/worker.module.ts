import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { DownloadVideoJobHandler } from '@/src/worker/download-video.worker';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';


@Module({
  imports: [AppConfigModule, RabbitMQModule, HttpClientsModule],
  controllers: [],
  providers: [DownloadVideoJobHandler]
})
export class WorkerModule {
}
