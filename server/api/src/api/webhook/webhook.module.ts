import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookService } from './services/webhook.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
