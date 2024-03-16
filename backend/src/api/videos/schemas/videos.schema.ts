import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';


export const VIDEO_COLLECTION_NAME = 'videos';

@Schema({
  timestamps: true,
  collection: VIDEO_COLLECTION_NAME
})
export class VideoDocument extends AbstractDocument {
  @Prop({
    required: true
  })
  title: string;

  @Prop({
    required: false
  })
  description?: string;

  @Prop({
    required: false
  })
  duration?: number;

  @Prop({
    required: true
  })
  source_url?: string;

  @Prop({
    required: false
  })
  height?: number;

  @Prop({
    required: false
  })
  width?: number;

  @Prop({
    required: false
  })
  thumbnail_url?: string;

  @Prop({
    required: false
  })
  size?: number;

  @Prop({
    required: false
  })
  master_playlist_name?: string;

  @Prop({
    required: true
  })
  latest_status?: string;

  @Prop({
    required: false
  })
  tags?: string[];

  @Prop({
    required: false,
    default: false
  })
  is_deleted?: boolean;

}

export const VideoSchema = SchemaFactory.createForClass(VideoDocument);