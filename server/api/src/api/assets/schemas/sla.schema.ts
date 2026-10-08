import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AssetSlaDocument {
  @Prop({ required: false })
  started_at?: Date;

  @Prop({ required: false })
  warning_alerted_at?: Date;
}

export const AssetSlaSchema = SchemaFactory.createForClass(AssetSlaDocument);
