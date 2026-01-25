import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WEBHOOK_RESPONSE_COLLECTION_NAME,
  WebhookResponseDocument,
} from '@/src/api/webhook/schemas/webhook-response.schema';

@Injectable()
export class WebhookResponseRepository extends BaseRepository<WebhookResponseDocument> {
  constructor(
    @InjectModel(WEBHOOK_RESPONSE_COLLECTION_NAME)
    webhookResponseDocumentModel: Model<WebhookResponseDocument>
  ) {
    super(webhookResponseDocumentModel);
  }
}
