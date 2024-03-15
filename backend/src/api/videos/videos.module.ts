import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VIDEO_COLLECTION_NAME, VideoSchema } from './schemas/videos.schema';
import { VideoRepository } from './repositories/video.repository';
import { VideoService } from './services/video.service';
import { VideoResolver } from './resolvers/video.resolver';
import { VideoMapper } from '@/src/api/videos/mapper/video.mapper';

@Module({
  imports: [MongooseModule.forFeatureAsync([{
    name: VIDEO_COLLECTION_NAME,
    useFactory: () => {
      return VideoSchema;
    }
  }])],
  providers: [VideoRepository, VideoService, VideoResolver, VideoMapper]
})
export class VideosModule {
}
