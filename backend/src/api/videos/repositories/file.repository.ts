import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FILE_COLLECTION_NAME, FileDocument } from '@/src/api/videos/schemas/files.schema';

@Injectable()
export class FileRepository extends BaseRepository<FileDocument> {
  constructor(@InjectModel(FILE_COLLECTION_NAME)  fileDocumentModel: Model<FileDocument>) {
    super(fileDocumentModel);
  }



}
