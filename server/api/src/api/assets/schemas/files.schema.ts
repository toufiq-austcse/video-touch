import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';
import { Types } from 'mongoose';
import { StatusDocument, StatusSchema } from '@/src/api/assets/schemas/status.schema';

export const FILE_COLLECTION_NAME = 'files';

@Schema({
  timestamps: true,
  collection: FILE_COLLECTION_NAME,
})
export class FileDocument extends AbstractDocument {
  @Prop({ required: true, index: true })
  asset_id: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  latest_status: string;

  @Prop({ required: false, default: [], type: [StatusSchema] })
  status_logs: [Omit<StatusDocument, '_id'>];

  @Prop({ required: false })
  job_id?: string;
}

export const FileSchema = SchemaFactory.createForClass(FileDocument);
