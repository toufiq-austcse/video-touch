import { Module } from '@nestjs/common';
import { GeminiClientService } from '@/src/common/gen-ai-models/gemini/gemini-client.service';
import { OpenAiClientService } from '@/src/common/gen-ai-models/open-ai/open-ai-client.service';

@Module({
  imports: [],
  providers: [GeminiClientService, OpenAiClientService],
  exports: [GeminiClientService, OpenAiClientService],
})
export class GenAiClientModule {}
