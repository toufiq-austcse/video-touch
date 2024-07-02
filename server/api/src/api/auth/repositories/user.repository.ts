import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_COLLECTION_NAME, UserDocument } from '@/src/api/auth/schemas/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(USER_COLLECTION_NAME) userDocumentModel: Model<UserDocument>) {
    super(userDocumentModel);
  }
}
