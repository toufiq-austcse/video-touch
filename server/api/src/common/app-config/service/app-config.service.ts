import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../environment';

@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    let port = this.configService.get('API_PORT', 3000, { infer: true });
    AppConfigService.appConfig = {
      API_PORT: port,
      APP_NAME: this.configService.get('APP_NAME', 'Video Touch'),
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
      RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY: this.configService.getOrThrow(
        'RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY'
      ),
      RABBIT_MQ_UPDATE_ASSET_STATUS_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_STATUS_QUEUE'),

      MAX_VIDEO_SIZE_IN_BYTES: this.configService.getOrThrow('MAX_VIDEO_SIZE_IN_BYTES', { infer: true }),
      AWS_ACCESS_KEY_ID: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      AWS_REGION: this.configService.getOrThrow('AWS_REGION'),
      AWS_SECRET_ACCESS_KEY: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      AWS_S3_BUCKET_NAME: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
      VIDEO_BASE_URL: this.configService.getOrThrow('VIDEO_BASE_URL'),
      TEMP_UPLOAD_DIRECTORY: this.configService.getOrThrow('TEMP_UPLOAD_DIRECTORY'),
      RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY'),
      RABBIT_MQ_UPDATE_ASSET_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPDATE_ASSET_QUEUE'),
      RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: this.configService.getOrThrow(
        'RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY'
      ),
      RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE: this.configService.getOrThrow('RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE'),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY'),
      CDN_BASE_URL: this.configService.getOrThrow('CDN_BASE_URL'),
      DEFAULT_THUMBNAIL_URL: this.configService.getOrThrow('DEFAULT_THUMBNAIL_URL'),
      JWT_EXPIRATION_TIME_IN_SEC: +this.configService.getOrThrow('JWT_EXPIRATION_TIME_IN_SEC'),
      JWT_SECRET: this.configService.getOrThrow('JWT_SECRET'),
      BULL_VALIDATE_JOB_QUEUE: this.configService.getOrThrow('BULL_VALIDATE_JOB_QUEUE'),
      BULL_DOWNLOAD_JOB_QUEUE: this.configService.getOrThrow('BULL_DOWNLOAD_JOB_QUEUE'),
      BULL_UPLOAD_JOB_QUEUE: this.configService.getOrThrow('BULL_UPLOAD_JOB_QUEUE'),
      BULL_360P_PROCESS_VIDEO_JOB_QUEUE: this.configService.getOrThrow('BULL_360P_PROCESS_VIDEO_JOB_QUEUE'),
      BULL_480P_PROCESS_VIDEO_JOB_QUEUE: this.configService.getOrThrow('BULL_480P_PROCESS_VIDEO_JOB_QUEUE'),
      BULL_540P_PROCESS_VIDEO_JOB_QUEUE: this.configService.getOrThrow('BULL_540P_PROCESS_VIDEO_JOB_QUEUE'),
      BULL_720P_PROCESS_VIDEO_JOB_QUEUE: this.configService.getOrThrow('BULL_720P_PROCESS_VIDEO_JOB_QUEUE'),
      BULL_1080P_PROCESS_VIDEO_JOB_QUEUE: this.configService.getOrThrow('BULL_1080P_PROCESS_VIDEO_JOB_QUEUE'),
      BULL_THUMBNAIL_GENERATION_JOB_QUEUE: this.configService.getOrThrow('BULL_THUMBNAIL_GENERATION_JOB_QUEUE'),
      BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE: this.configService.getOrThrow('BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE'),
      REDIS_HOST: this.configService.getOrThrow('REDIS_HOST'),
      REDIS_PORT: this.configService.getOrThrow('REDIS_PORT'),
      MIN_AVAILABLE_DISK_SPACE_REQUIRED_IN_BYTES: +this.configService.get(
        'MIN_AVAILABLE_DISK_SPACE_REQUIRED_IN_BYTES',
        2147483648
      ),
      RETRY_JOB_ATTEMPT_COUNT: +this.configService.get('RETRY_JOB_ATTEMPT_COUNT', 3),
      RETRY_JOB_BACKOFF_IN_MINUTE: +this.configService.get('RETRY_JOB_BACKOFF_IN_MINUTE', 10),
      GOTIPATH_CDN_SECRET: this.configService.getOrThrow('GOTIPATH_CDN_SECRET'),
      BULL_DOWNLOAD_FILE_GENERATION_JOB_QUEUE: this.configService.getOrThrow('BULL_DOWNLOAD_FILE_GENERATION_JOB_QUEUE'),
      WEBHOOK_URL: this.configService.getOrThrow('WEBHOOK_URL'),
      WEBHOOK_TOKEN: this.configService.getOrThrow('WEBHOOK_TOKEN'),
      BULL_AUDIO_EXTRACTION_JOB_QUEUE: this.configService.getOrThrow('BULL_AUDIO_EXTRACTION_JOB_QUEUE'),
      GOOGLE_GENAI_API_KEY: this.configService.get('GOOGLE_GENAI_API_KEY'),
      TRANSCRIPTION_GENERATION_ENABLED: this.configService.get('TRANSCRIPTION_GENERATION_ENABLED', 'false') === 'true',
      GOOGLE_GEN_AI_MODEL: this.configService.get('GOOGLE_GEN_AI_MODEL'),
      OPENAI_API_KEY: this.configService.get('OPENAI_API_KEY'),
      OPENAI_MODEL: this.configService.get('OPENAI_MODEL'),
      AUDIO_CHUNK_DURATION_IN_SEC: +this.configService.getOrThrow('AUDIO_CHUNK_DURATION_IN_SEC'),
    };
    this.validateTranscriptionGenerationEnabled();
  }

  validateTranscriptionGenerationEnabled() {
    if (!AppConfigService.appConfig.TRANSCRIPTION_GENERATION_ENABLED) {
      console.log('Transcription generation is disabled in the configuration.');
      return false;
    }
    if (!AppConfigService.appConfig.OPENAI_MODEL && !AppConfigService.appConfig.GOOGLE_GEN_AI_MODEL) {
      console.log('Transcription generation is enabled, but no model is configured.');
      process.exit(1);
    }
    //Transcription generation is enabled, validate API keys and models
    if (AppConfigService.appConfig.OPENAI_MODEL) {
      if (!AppConfigService.appConfig.OPENAI_API_KEY) {
        console.log('Model for OpenAI is set but API key is missing.');
        process.exit(1);
      }
    }
    if (AppConfigService.appConfig.GOOGLE_GEN_AI_MODEL) {
      if (!AppConfigService.appConfig.GOOGLE_GENAI_API_KEY) {
        console.log('Model for Google GenAI is set but API key is missing.');
        process.exit(1);
      }
    }

    return null;
  }
}
