import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import {
  SLA_NOTIFICATION_COLLECTION_NAME,
  SlaChannelName,
  SlaNotificationKind,
  SlaNotificationStatus,
  SlaTier,
} from '@/src/api/sla/sla.constants';

@Schema({
  timestamps: true,
  collection: SLA_NOTIFICATION_COLLECTION_NAME,
})
export class SlaNotificationDocument extends AbstractDocument {
  @Prop({ required: true, type: String })
  channel: SlaChannelName;

  @Prop({ required: true, type: String })
  kind: SlaNotificationKind;

  @Prop({ required: true, type: String })
  tier: SlaTier;

  @Prop({ required: true, type: [Types.ObjectId], default: [] })
  asset_ids: Types.ObjectId[];

  @Prop({ required: true, type: Object })
  payload: Record<string, any>;

  @Prop({ required: true, type: String })
  status: SlaNotificationStatus;

  @Prop({ required: true, default: 0 })
  attempts: number;

  @Prop({ required: false })
  next_attempt_at?: Date;

  @Prop({ required: false })
  last_error?: string;

  @Prop({ required: false })
  sent_at?: Date;
}

export const SlaNotificationSchema = SchemaFactory.createForClass(SlaNotificationDocument);

SlaNotificationSchema.index({ status: 1, next_attempt_at: 1 });
