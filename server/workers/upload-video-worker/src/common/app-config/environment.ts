export interface EnvironmentVariables {
  PORT: number;
  RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: string;
  RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_UPLOAD_VIDEO_QUEUE: string;
  RABBIT_MQ_URL: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_REGION: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE: string;
  RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: string;
}