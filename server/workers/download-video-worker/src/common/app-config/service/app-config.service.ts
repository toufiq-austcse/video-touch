import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';


@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {

    AppConfigService.appConfig = {
      DOWNLOAD_VIDEO_WORKER_PORT: +this.configService.getOrThrow('DOWNLOAD_VIDEO_WORKER_PORT'),
      RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE'),
      RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      MAX_VIDEO_SIZE_IN_BYTES: +this.configService.get('MAX_VIDEO_SIZE_IN_BYTES', 5242880),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY'),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY')
    };
  }
}
