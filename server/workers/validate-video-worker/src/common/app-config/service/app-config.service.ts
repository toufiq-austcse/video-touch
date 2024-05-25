import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';


@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {

    AppConfigService.appConfig = {
      PORT: +this.configService.getOrThrow('PORT'),
      RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_VALIDATE_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_VALIDATE_VIDEO_QUEUE'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      MAX_VIDEO_SIZE_IN_BYTES: +this.configService.get('MAX_VIDEO_SIZE_IN_BYTES', 5242880),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY'),
      RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY')
    };
  }
}
