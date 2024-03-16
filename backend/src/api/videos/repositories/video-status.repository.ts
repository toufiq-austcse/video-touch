import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VIDEO_STATUS_COLLECTION_NAME, VideoStatusDocument } from '@/src/api/videos/schemas/videos-status.schema';

@Injectable()
export class VideoStatusRepository extends BaseRepository<VideoStatusDocument> {
  constructor(@InjectModel(VIDEO_STATUS_COLLECTION_NAME) videoStatusModel: Model<VideoStatusDocument>) {
    super(videoStatusModel);
  }

}