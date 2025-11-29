import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';
import { getTranscriptionPrompt } from '@/src/common/utils';
import { createWriteStream } from 'fs';

@Injectable()
export class GeminiClientService implements OnModuleInit {
  private aiClient: GoogleGenAI;

  constructor() {}

  onModuleInit() {
    this.aiClient = new GoogleGenAI({
      apiKey: AppConfigService.appConfig.GOOGLE_GENAI_API_KEY,
    });
  }

  async transcribeAudio(localFilePath: string, outputFilePath: string) {
    const uploadedFile = await this.aiClient.files.upload({
      file: localFilePath,
      config: { mimeType: 'audio/mp3' },
    });

    const stream = await this.aiClient.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        getTranscriptionPrompt(),
      ]),
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
