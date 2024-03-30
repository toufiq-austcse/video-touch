import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VIDEO_COLLECTION_NAME, VideoSchema } from './schemas/videos.schema';
import { VideoRepository } from './repositories/video.repository';
import { VideoService } from './services/video.service';
import { VideoResolver } from './resolvers/video.resolver';
import { VideoMapper } from '@/src/api/videos/mapper/video.mapper';
import { VIDEO_STATUS_COLLECTION_NAME, VideoStatusSchema } from '@/src/api/videos/schemas/videos-status.schema';
import { ModuleRef } from '@nestjs/core';
import { VideoStatusRepository } from '@/src/api/videos/repositories/video-status.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: VIDEO_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function () {
            //console.log('pre save hook');
            //const video = this;
            // console.log('video', video);
            // (video as any).latest_status = VIDEO_STATUS.QUEUED;
            // const user = this;
            // user.password = await getHashedPassword(user.password);
          });
          schema.post('save', async (data) => {
            let videoService = moduleRef.get<VideoService>(VideoService, { strict: false });

            console.log('post save hook');
            await videoService.insertVideoStatus(data);
            return;
          });
          return schema;
        },
      },
      {
        name: VIDEO_STATUS_COLLECTION_NAME,
        useFactory: () => {
          return VideoStatusSchema;
        },
      },
    ]),
  ],
  providers: [VideoRepository, VideoStatusRepository, VideoService, VideoResolver, VideoMapper],
})
export class VideosModule {}
