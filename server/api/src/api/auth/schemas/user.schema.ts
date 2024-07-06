import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';

export const USER_COLLECTION_NAME = 'users';

@Schema({
  timestamps: true,
  collection: USER_COLLECTION_NAME,
})
export class UserDocument extends AbstractDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
