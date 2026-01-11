import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WebhookService } from './services/webhook.service';
import { WEBHOOK_COLLECTION_NAME, WebhookSchema } from '@/src/api/webhook/schemas/webhook.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleRef } from '@nestjs/core';
import { WebhookResolver } from '@/src/api/webhook/resolvers/webhook.resolver';
import { WebhookRepository } from '@/src/api/webhook/repositories/webhook.repository';

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
    ]),
  ],
  controllers: [],
  providers: [WebhookService, WebhookResolver, WebhookRepository],
  exports: [WebhookService],
})
export class WebhookModule {}
