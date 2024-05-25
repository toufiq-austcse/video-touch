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
  RABBIT_MQ_DOWNLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_VALIDATE_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_VALIDATE_VIDEO_QUEUE: string;
  RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY: string;
  RABBIT_MQ_UPDATE_ASSET_STATUS_QUEUE: string;
  RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: string;
  RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE: string;
  RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY: string;
  RABBIT_MQ_UPDATE_ASSET_QUEUE: string;
  MAX_VIDEO_SIZE_IN_BYTES: number;

  RABBIT_MQ_1080P_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_1080P_PROCESS_VIDEO_QUEUE: string;
  RABBIT_MQ_720P_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_720P_PROCESS_VIDEO_QUEUE: string;
  RABBIT_MQ_540P_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_540P_PROCESS_VIDEO_QUEUE: string;
  RABBIT_MQ_480P_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_480P_PROCESS_VIDEO_QUEUE: string;
  RABBIT_MQ_360P_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_360P_PROCESS_VIDEO_QUEUE: string;

  RABBIT_MQ_1080P_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_1080P_UPLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_720P_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_720P_UPLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_540P_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_540P_UPLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_480P_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_480P_UPLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE: string;

  AWS_ACCESS_KEY_ID: string;
  AWS_REGION: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET_NAME: string;
  VIDEO_BASE_URL: string;

  TEMP_UPLOAD_FOLDER: string;
}
