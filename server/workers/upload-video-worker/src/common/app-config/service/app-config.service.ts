import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';

@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    AppConfigService.appConfig = {
      UPLOAD_VIDEO_WORKER_PORT: +this.configService.getOrThrow('UPLOAD_VIDEO_WORKER_PORT'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      AWS_S3_BUCKET_NAME: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
      AWS_REGION: this.configService.getOrThrow('AWS_REGION'),
      AWS_SECRET_ACCESS_KEY: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      AWS_ACCESS_KEY_ID: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE'),
      RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: this.configService.getOrThrow(
        'RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY',
      ),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY'),
      AWS_PROFILE_NAME: this.configService.get('AWS_PROFILE_NAME'),
      BULL_UPLOAD_JOB_QUEUE: this.configService.getOrThrow('BULL_UPLOAD_JOB_QUEUE'),
      REDIS_HOST: this.configService.getOrThrow('REDIS_HOST'),
      REDIS_PORT: +this.configService.getOrThrow('REDIS_PORT'),
      STORAGE_PROVIDER: this.configService.getOrThrow('STORAGE_PROVIDER'),
      BUNNY_STORAGE_ZONE_NAME: this.configService.get('BUNNY_STORAGE_ZONE_NAME'),
      BUNNY_STORAGE_URL: this.configService.get('BUNNY_STORAGE_URL'),
      BUNNY_ACCESS_KEY: this.configService.get('BUNNY_ACCESS_KEY'),
    };
  }
}
