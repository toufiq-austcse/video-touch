import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../environment';

@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    let port = this.configService.get('PORT', 3000, { infer: true });
    AppConfigService.appConfig = {
      PORT: port,
      SWAGGER_SERVER_BASE_URL: this.configService.get('SWAGGER_SERVER_BASE_URL', `http://localhost:${port}`),
      SWAGGER_SERVER_BASE_URL_DESCRIPTION: this.configService.get(
        'SWAGGER_SERVER_BASE_URL_DESCRIPTION',
        'Swagger Server Base URL'
      ),
      SWAGGER_TITLE: this.configService.get('SWAGGER_TITLE', 'NEST BOILERPLATE'),
      SWAGGER_DESCRIPTION: this.configService.get('SWAGGER_DESCRIPTION', 'NEST BOILERPLATE API'),
      SWAGGER_VERSION: this.configService.get('SWAGGER_VERSION', '1.0'),
      DB_DRIVER: this.configService.get('DB_DRIVER', { infer: true }),
      DB_HOST: this.configService.get('DB_HOST', { infer: true }),
      DB_MIGRATE: this.configService.get('DB_MIGRATE', 'false', { infer: true }),
      DB_NAME: this.configService.get('DB_NAME', { infer: true }),
      DB_PASSWORD: this.configService.get('DB_PASSWORD', { infer: true }),
      DB_PORT: this.configService.get('DB_PORT', { infer: true }),
      DB_USER: this.configService.get('DB_USER', { infer: true }),
      SWAGGER_USERNAME: this.configService.get('SWAGGER_USERNAME', 'toufiq'),
      SWAGGER_PASSWORD: this.configService.get('SWAGGER_PASSWORD', '1010'),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE'),
      RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY'),
      MAX_VIDEO_SIZE_IN_BYTES: +this.configService.get('MAX_VIDEO_SIZE_IN_BYTES', 5242880),
      RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_VALIDATE_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_VALIDATE_VIDEO_QUEUE'),
      RABBIT_MQ_1080P_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_1080P_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_1080P_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_1080P_VIDEO_QUEUE'),
      RABBIT_MQ_720P_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_720P_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_720P_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_720P_VIDEO_QUEUE'),
      RABBIT_MQ_540P_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_540P_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_540P_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_540P_VIDEO_QUEUE'),
      RABBIT_MQ_480P_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_480P_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_480P_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_480P_VIDEO_QUEUE'),
      RABBIT_MQ_360P_VIDEO_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_360P_VIDEO_ROUTING_KEY'),
      RABBIT_MQ_360P_VIDEO_QUEUE: this.configService.getOrThrow('RABBIT_MQ_360P_VIDEO_QUEUE')
    };
  }
}
