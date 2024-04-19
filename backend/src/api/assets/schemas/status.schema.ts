import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';

@Schema({
  timestamps: true
})
export class StatusDocument extends AbstractDocument {

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  details: string;
}

export const StatusSchema = SchemaFactory.createForClass(StatusDocument);