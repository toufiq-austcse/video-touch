import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { Types } from 'mongoose';

export const WEBHOOK_COLLECTION_NAME = 'webhooks';

@Schema({
  timestamps: true,
  collection: WEBHOOK_COLLECTION_NAME,
})
export class WebHookDocument extends AbstractDocument {
  @Prop({ required: true, index: true })
  user_id: Types.ObjectId;

  @Prop({
    required: true,
  })
  url: string;

  @Prop({
    required: false,
  })
  secret_token: string;
}

export const WebhookSchema = SchemaFactory.createForClass(WebHookDocument);
