import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { StatusDocument, StatusSchema } from '@/src/api/assets/schemas/status.schema';

export const ASSET_COLLECTION_NAME = 'assets';

@Schema({
  timestamps: true,
  collection: ASSET_COLLECTION_NAME,
})
export class AssetDocument extends AbstractDocument {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: false,
  })
  description?: string;

  @Prop({
    required: false,
  })
  duration?: number;

  @Prop({
    required: true,
  })
  source_url?: string;

  @Prop({
    required: false,
  })
  height?: number;

  @Prop({
    required: false,
  })
  width?: number;

  @Prop({
    required: false,
  })
  size?: number;

  @Prop({
    required: false,
  })
  master_file_name?: string;

  @Prop({
    required: false,
  })
  latest_status?: string;

  @Prop({
    required: false,
  })
  tags?: string[];

  @Prop({
    required: false,
    default: false,
  })
  is_deleted?: boolean;

  @Prop({ required: false, default: [], type: [StatusSchema] })
  status_logs?: [Omit<StatusDocument, '_id'>];
}

export const VideoSchema = SchemaFactory.createForClass(AssetDocument);
