import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';

@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    AppConfigService.appConfig = {
      THUMBNAIL_WORKER_PORT: +this.configService.getOrThrow('THUMBNAIL_WORKER_PORT'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: this.configService.getOrThrow(
        'RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY',
      ),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY'),
      BULL_THUMBNAIL_GENERATION_JOB_QUEUE: this.configService.getOrThrow('BULL_THUMBNAIL_GENERATION_JOB_QUEUE'),
      AWS_REGION: this.configService.getOrThrow('AWS_REGION'),
      AWS_SECRET_ACCESS_KEY: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      AWS_ACCESS_KEY_ID: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      AWS_S3_BUCKET_NAME: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
      REDIS_HOST: this.configService.getOrThrow('REDIS_HOST'),
      REDIS_PORT: +this.configService.getOrThrow('REDIS_PORT'),
      STORAGE_PROVIDER: this.configService.getOrThrow('STORAGE_PROVIDER'),
      BUNNY_STORAGE_ZONE_NAME: this.configService.get('BUNNY_STORAGE_ZONE_NAME'),
      BUNNY_STORAGE_URL: this.configService.get('BUNNY_STORAGE_URL'),
      BUNNY_ACCESS_KEY: this.configService.get('BUNNY_ACCESS_KEY'),
    };
  }
}
