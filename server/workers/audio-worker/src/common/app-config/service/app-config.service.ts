import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/src/common/app-config/environment';

@Injectable()
export class AppConfigService {
  public static appConfig: EnvironmentVariables;

  constructor(private configService: ConfigService<EnvironmentVariables>) {
    AppConfigService.appConfig = {
      AUDIO_WORKER_PORT: +this.configService.getOrThrow('AUDIO_WORKER_PORT'),
      RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE: this.configService.getOrThrow('RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE'),
      RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY: this.configService.getOrThrow(
        'RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY',
      ),
      RABBIT_MQ_URL: this.configService.getOrThrow('RABBIT_MQ_URL'),
      TEMP_VIDEO_DIRECTORY: this.configService.getOrThrow('TEMP_VIDEO_DIRECTORY'),
      BULL_AUDIO_EXTRACTION_JOB_QUEUE: this.configService.getOrThrow('BULL_AUDIO_EXTRACTION_JOB_QUEUE'),
      REDIS_HOST: this.configService.getOrThrow('REDIS_HOST'),
      REDIS_PORT: +this.configService.getOrThrow('REDIS_PORT'),
      BULL_UPLOAD_JOB_QUEUE: this.configService.getOrThrow('BULL_UPLOAD_JOB_QUEUE'),
      BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE: this.configService.getOrThrow('BULL_AUDIO_TRANSCRIPTION_JOB_QUEUE'),
      TRANSCRIPTION_GENERATION_ENABLED: this.configService.get('TRANSCRIPTION_GENERATION_ENABLED') === 'true',
      GOOGLE_GENAI_API_KEY: this.configService.get('GOOGLE_GENAI_API_KEY'),
      OPENAI_API_KEY: this.configService.get('OPENAI_API_KEY'),
      GOOGLE_GEN_AI_MODEL: this.configService.get('GOOGLE_GEN_AI_MODEL'),
      OPENAI_MODEL: this.configService.get('OPENAI_MODEL'),
      BULL_AUDIO_SPLIT_JOB_QUEUE: this.configService.getOrThrow('BULL_AUDIO_SPLIT_JOB_QUEUE'),
    };
  }
}
