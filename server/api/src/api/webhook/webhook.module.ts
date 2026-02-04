import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookService } from './services/webhook.service';
import { WEBHOOK_COLLECTION_NAME, WebhookSchema } from '@/src/api/webhook/schemas/webhook.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleRef } from '@nestjs/core';
import { WebhookResolver } from '@/src/api/webhook/resolvers/webhook.resolver';
import { WebhookRepository } from '@/src/api/webhook/repositories/webhook.repository';
import { WebhookNotifyConsumer } from '@/src/api/webhook/consumers/webhook-notify-consumer.service';
import { WebhookResponseService } from '@/src/api/webhook/services/webhook-response.service';
import { WebhookResponseRepository } from '@/src/api/webhook/repositories/webhook-response.repository';
import {
  WEBHOOK_RESPONSE_COLLECTION_NAME,
  WebhookResponseSchema,
} from '@/src/api/webhook/schemas/webhook-response.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeatureAsync([
      {
        name: WEBHOOK_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          return WebhookSchema;
        },
      },
      {
        name: WEBHOOK_RESPONSE_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          return WebhookResponseSchema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [
    WebhookService,
    WebhookResponseService,
    WebhookResolver,
    WebhookRepository,
    WebhookResponseRepository,
    WebhookNotifyConsumer,
  ],
  exports: [WebhookService],
})
export class WebhookModule {}
