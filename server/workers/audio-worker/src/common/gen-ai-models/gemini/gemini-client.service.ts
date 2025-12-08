import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { createPartFromUri, createUserContent, GenerateContentConfig, GoogleGenAI } from '@google/genai';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GeminiClientService implements OnModuleInit {
  private aiClient: GoogleGenAI;
  private promtText: string;

  constructor(private httpService: HttpService) {}

  onModuleInit() {
    if (!AppConfigService.appConfig.GOOGLE_GENAI_API_KEY) {
      return;
    }
    this.aiClient = new GoogleGenAI({
      apiKey: AppConfigService.appConfig.GOOGLE_GENAI_API_KEY,
    });
    this.setupPrompt().then(() => {
      console.log('prompt loaded');
    });
  }

  async setupPrompt() {
    const promptUrl = AppConfigService.appConfig.TRANSCRIPT_PROMT_FILE_URL;
    const response = await this.httpService.axiosRef.get<string>(promptUrl);
    this.promtText = response.data;
    console.log(this.promtText);
  }

  async transcribeAudio(localFilePath: string, outputFilePath: string) {
    const uploadedFile = await this.aiClient.files.upload({
      file: localFilePath,
      config: { mimeType: 'audio/mp3' },
    });

    let config: GenerateContentConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            start: {
              type: 'STRING',
              description: 'Start time in HH:MM:SS format (e.g., 00:01:30, 01:25:45)',
            },
            end: {
              type: 'STRING',
              description: 'End time in HH:MM:SS format (e.g., 00:01:45, 01:26:00)',
            },
            text: {
              type: 'STRING',
              description: 'Transcribed text in original language',
            },
          },
          required: ['start', 'end', 'text'],
        },
      },
    };
    if (AppConfigService.appConfig.GOOGLE_GENAI_THINKING_LEVEL) {
      config.thinkingConfig = {
        thinkingLevel: AppConfigService.appConfig.GOOGLE_GENAI_THINKING_LEVEL as any,
      };
    }

    if (AppConfigService.appConfig.GOOGLE_GENAI_TEMPERATURE) {
      config.temperature = AppConfigService.appConfig.GOOGLE_GENAI_TEMPERATURE;
    }

    const stream = await this.aiClient.models.generateContentStream({
      model: AppConfigService.appConfig.GOOGLE_GEN_AI_MODEL,
      contents: createUserContent([createPartFromUri(uploadedFile.uri, uploadedFile.mimeType), this.promtText]),
      config: config,
    });

    const writeStream = createWriteStream(outputFilePath);

    console.log('Starting transcription streaming...');
    for await (const chunk of stream) {
      const text = chunk.text || '';
      writeStream.write(text);
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.end(() => {
        console.log('Transcription streaming completed.');
        resolve();
      });
      writeStream.on('error', reject);
    });

    console.log(`Transcription saved to ${outputFilePath}`);
  }
}
