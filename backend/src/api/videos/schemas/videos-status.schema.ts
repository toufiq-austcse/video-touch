import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { Types } from 'mongoose';

export const VIDEO_STATUS_COLLECTION_NAME = 'video_statuses';

@Schema({
  timestamps: true,
  collection: VIDEO_STATUS_COLLECTION_NAME,
})
export class VideoStatusDocument extends AbstractDocument {
  @Prop({ required: true, index: true })
  video_id: Types.ObjectId;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false })
  details?: string;
}

export const VideoStatusSchema = SchemaFactory.createForClass(VideoStatusDocument);
