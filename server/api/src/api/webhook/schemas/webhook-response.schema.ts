import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { Types } from 'mongoose';

export const WEBHOOK_RESPONSE_COLLECTION_NAME = 'webhook_responses';

@Schema({
  timestamps: true,
  collection: WEBHOOK_RESPONSE_COLLECTION_NAME,
})
export class WebhookResponseDocument extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  asset_id: Types.ObjectId;

  @Prop({ required: true })
  event_type: string;

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true, type: Object })
  response: Record<string, any>;

  @Prop({ required: false, type: Object })
  error?: any;
}

export const WebhookResponseSchema = SchemaFactory.createForClass(WebhookResponseDocument);
