import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { ProcessVideoWorker } from '@/src/worker/process-video.worker';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { TranscodingService } from '@/src/worker/transcoding.service';
import { ManifestService } from '@/src/worker/manifest.service';


@Module({
  imports: [AppConfigModule, RabbitMQModule, HttpClientsModule],
  controllers: [],
  providers: [ProcessVideoWorker, TranscodingService, ManifestService]
})
export class WorkerModule {
}
