import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';

export const VIDEO_COLLECTION_NAME = 'videos';

@Schema({
  timestamps: true
})
export class RenditionDocument extends AbstractDocument {
  @Prop()
  playlist_path: string;

  @Prop()
  height: number;

  @Prop()
  width: number;

  @Prop()
  size: number;
}

export const RenditionSchema = SchemaFactory.createForClass(RenditionDocument);

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
    required: false
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


  @Prop({
    required: false,
    default: [],
    type: [RenditionSchema]
  })
  renditions?: {
    playlist_path: string;
    height: number;
    width: number;
    size: number;
  }[];

}

export const VideoSchema = SchemaFactory.createForClass(VideoDocument);
