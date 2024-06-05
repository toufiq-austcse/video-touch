import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

async function bootstrap() {
  let app = await NestFactory.create(WorkerModule);
  await app.listen(AppConfigService.appConfig.PROCESS_VIDEO_WORKER_PORT);
}

bootstrap();
