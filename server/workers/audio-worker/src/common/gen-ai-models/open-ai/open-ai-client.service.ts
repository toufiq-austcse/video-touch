import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import OpenAI from 'openai';
import { readFileSync, createWriteStream } from 'fs';
import { getTranscriptionPrompt } from '@/src/common/utils';

@Injectable()
export class OpenAiClientService implements OnModuleInit {
  private aiClient: OpenAI;

  constructor() {}

  onModuleInit() {
    this.aiClient = new OpenAI({
      apiKey: AppConfigService.appConfig.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(localFilePath: string, outputFilePath: string) {
    console.log('Starting transcription with GPT-4o audio...');

    // Read and encode audio file to base64
    const audioBuffer = readFileSync(localFilePath);
    const audioBase64 = audioBuffer.toString('base64');

    // Using GPT-4o audio model with chat completions for streaming support
    const stream = await this.aiClient.chat.completions.create({
      model: 'gpt-4o-audio-preview',
      modalities: ['text'],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'input_audio',
              input_audio: {
                data: audioBase64,
                format: 'mp3',
              },
            },
            {
              type: 'text',
              text: getTranscriptionPrompt(),
            },
          ],
        },
      ],
      stream: true,
    });

    const writeStream = createWriteStream(outputFilePath);

    console.log('Starting transcription streaming...');
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        writeStream.write(content);
      }
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
