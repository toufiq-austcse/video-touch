import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { AwsModule } from '@/src/common/aws/aws.module';
import { VideoUploaderJobHandler } from '@/src/worker/upload-video.worker';


@Module({
  imports: [AppConfigModule, RabbitMQModule, AwsModule],
  controllers: [],
  providers: [VideoUploaderJobHandler]
})
export class WorkerModule {
}
