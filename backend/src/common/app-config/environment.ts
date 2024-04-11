export interface EnvironmentVariables {
  PORT: number;

  SWAGGER_TITLE: string;
  SWAGGER_DESCRIPTION: string;
  SWAGGER_VERSION: string;
  SWAGGER_SERVER_BASE_URL: string;
  SWAGGER_SERVER_BASE_URL_DESCRIPTION: string;

  SWAGGER_USERNAME: string;
  SWAGGER_PASSWORD: string;
  DB_DRIVER: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_MIGRATE: string;

  RABBIT_MQ_URL: string;
  RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: string;
  RABBIT_MQ_DOWNLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY: string;
}
