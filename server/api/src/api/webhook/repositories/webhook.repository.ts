import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WEBHOOK_COLLECTION_NAME, WebHookDocument } from '@/src/api/webhook/schemas/webhook.schema';

@Injectable()
export class WebhookRepository extends BaseRepository<WebHookDocument> {
  constructor(@InjectModel(WEBHOOK_COLLECTION_NAME) webHookDocumentModel: Model<WebHookDocument>) {
    super(webHookDocumentModel);
  }
}
