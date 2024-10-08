export interface EnvironmentVariables {
  PROCESS_VIDEO_WORKER_PORT: number;
  RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: string;
  RABBIT_MQ_PROCESS_VIDEO_QUEUE: string;
  RABBIT_MQ_PROCESS_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: string;
  RABBIT_MQ_UPLOAD_VIDEO_ROUTING_KEY: string;
  RABBIT_MQ_URL: string;
  TEMP_VIDEO_DIRECTORY: string;
  RABBIT_MQ_PROCESS_VIDEO_PREFETCH_COUNT: number;
}
