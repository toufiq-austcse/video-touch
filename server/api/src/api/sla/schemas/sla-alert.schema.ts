import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { SLA_ALERT_COLLECTION_NAME, SlaTier } from '@/src/api/sla/sla.constants';

@Schema({
  timestamps: true,
  collection: SLA_ALERT_COLLECTION_NAME,
})
export class SlaAlertDocument extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  asset_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: String })
  tier: SlaTier;

  @Prop({ required: true })
  threshold_minutes: number;

  @Prop({ required: true })
  asset_status_at_alert: string;

  @Prop({ required: true })
  sla_started_at: Date;

  @Prop({ required: true })
  elapsed_minutes: number;

  @Prop({ required: true, type: Types.ObjectId, index: true })
  notification_id: Types.ObjectId;
}

export const SlaAlertSchema = SchemaFactory.createForClass(SlaAlertDocument);

// One alert per asset per tier per clock run; backs up the atomic claim on the asset.
SlaAlertSchema.index({ asset_id: 1, tier: 1, sla_started_at: 1 }, { unique: true });
