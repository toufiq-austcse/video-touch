import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import OpenAI from 'openai';
import * as fs from 'node:fs';
import { createWriteStream } from 'fs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OpenAiClientService implements OnModuleInit {
  private aiClient: OpenAI;
  private promtText: string;

  constructor(private httpService: HttpService) {}

  onModuleInit() {
    if (!AppConfigService.appConfig.OPENAI_API_KEY) {
      return;
    }
    this.aiClient = new OpenAI({
      apiKey: AppConfigService.appConfig.OPENAI_API_KEY,
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
    console.log('Starting transcription with OpenAI...');

    const model = AppConfigService.appConfig.OPENAI_MODEL;

    // For GPT-4o models, use chat completions with audio input for better prompt control
    if (model.includes('gpt-4o')) {
      await this.transcribeWithGPT4o(localFilePath, outputFilePath);
    } else {
      // For Whisper, use standard transcription API
      await this.transcribeWithWhisper(localFilePath, outputFilePath);
    }
  }

  private async transcribeWithGPT4o(localFilePath: string, outputFilePath: string) {
    console.log('Using GPT-4o audio models for Bangla transcription...');

    // Read and encode audio file to base64
    const audioBuffer = fs.readFileSync(localFilePath);
    const audioBase64 = audioBuffer.toString('base64');

    const stream = await this.aiClient.chat.completions.create({
      model: AppConfigService.appConfig.OPENAI_MODEL,
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
              text: this.promtText,
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

    console.log(`Bangla transcription saved to ${outputFilePath}`);
  }

  private async transcribeWithWhisper(localFilePath: string, outputFilePath: string) {
    console.log('Using Whisper for transcription...');

    const transcription = await this.aiClient.audio.transcriptions.create({
      file: fs.createReadStream(localFilePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const segments = (transcription as any).segments || [];
    const formattedOutput = segments.map((segment: any) => ({
      start_second: segment.start,
      end_second: segment.end,
      text: segment.text.trim(),
    }));

    const writeStream = createWriteStream(outputFilePath);
    writeStream.write(JSON.stringify(formattedOutput, null, 2));

    await new Promise<void>((resolve, reject) => {
      writeStream.end(() => {
        console.log(`Transcription completed. Processed ${formattedOutput.length} segments.`);
        resolve();
      });
      writeStream.on('error', reject);
    });

    console.log(`Transcription saved to ${outputFilePath}`);
  }
}
