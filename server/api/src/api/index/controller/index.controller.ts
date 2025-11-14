import { Controller, Get, OnModuleInit, Post } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai';

@Controller()
export class IndexController implements OnModuleInit {
  private aiClient: GoogleGenAI;

  constructor() {}
  onModuleInit() {
    this.aiClient = new GoogleGenAI({
      apiKey: AppConfigService.appConfig.GOOGLE_GENAI_API_KEY,
    });
  }

  @Get()
  async index() {
    return {
      app: `${AppConfigService.appConfig.APP_NAME} is running...`,
    };
  }

  @Post('/transcribe-audio')
  async transcribeAudioFile() {
    console.log('transcribeAudioFile called');
    let localFilePath = '/Users/toufiqulislam/projects/personal/video-touch/server/temp_videos/test.mp3';
    const uploadedFile = await this.aiClient.files.upload({
      file: localFilePath,
      config: { mimeType: 'audio/mp3' },
    });
    console.log('file uploaded:', uploadedFile);

    const stream = await this.aiClient.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        `You are a transcription assistant. Your task is to:
1. Transcribe the audio file to text
2. Identify sentence boundaries
3. Add accurate start and end timestamps (HH:MM:SS format) for each sentence
4. Return ONLY valid JSON array, no additional text

Format your response as a JSON array with this exact structure:
[
  {
    "startTime": "00:00:01",
    "endTime": "00:00:05",
    "text": "First sentence transcribed here"
  },
  {
    "startTime": "00:00:05",
    "endTime": "00:00:12",
    "text": "Second sentence transcribed here"
  }
]

Requirements:
- Use HH:MM:SS format for timestamps
- One complete sentence per object
- Ensure timestamps are sequential and accurate
- Return ONLY the JSON array, no markdown formatting or extra text`,
      ]),
    });

    for await (const chunk of stream) {
      console.log(chunk.text);
    }
  }
}
