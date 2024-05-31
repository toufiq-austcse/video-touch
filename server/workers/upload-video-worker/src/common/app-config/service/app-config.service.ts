import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';


@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {

    AppConfigService.appConfig = {
      PORT: +this.configService.getOrThrow('PORT'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_UPLOAD_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPLOAD_VIDEO_QUEUE'),
      AWS_S3_BUCKET_NAME: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
      AWS_REGION: this.configService.getOrThrow('AWS_REGION'),
      AWS_SECRET_ACCESS_KEY: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      AWS_ACCESS_KEY_ID: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE'),
      RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY'),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY')
    };
  }
}
