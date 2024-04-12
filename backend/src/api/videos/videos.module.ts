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
import { VIDEO_STATUS } from '@/src/common/constants';
import { VideoDownloadService } from '@/src/api/videos/services/video-download.service';
import { DownloadVideoJobHandler } from '@/src/api/videos/job-handler/download-video-job.handler';
import mongoose from 'mongoose';
import { VideoValidationJobHandler } from '@/src/api/videos/job-handler/video-validation-job.handler';
import { VideoProcessorJobHandler } from '@/src/api/videos/job-handler/video-processer-job-handler.service';
import { TranscodingService } from '@/src/api/videos/services/transcoding.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: VIDEO_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function() {
            console.log('videos pre save hook');
            const video = this;
            (video as any).latest_status = VIDEO_STATUS.QUEUED;
          });
          schema.post('save', async function() {
            let videoService = moduleRef.get<VideoService>(VideoService, { strict: false });
            console.log('post save hook');

            const video: any = this;
            await videoService.insertVideoStatus(video._id, video.latest_status, null);
            videoService.pushDownloadVideoJob(video).then(() => {
              console.log('pushed download videos job');
            }).catch(err => {
              console.log('error pushing download videos job', err);
            });
            return;
          });
          return schema;
        }
      },
      {
        name: VIDEO_STATUS_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoStatusSchema;

          schema.post('save', async function() {
            let videoRepository = moduleRef.get<VideoRepository>(VideoRepository, { strict: false });

            console.log('post save hook called in videos status schema');

            const videoStatus: any = this;
            await videoRepository.findOneAndUpdate({
              _id: mongoose.Types.ObjectId(videoStatus.video_id)
            }, {
              latest_status: videoStatus.status
            });
            console.log('updated videos status');

            return;
          });

          return schema;
        }
      }
    ])
  ],
  providers: [VideoRepository, VideoStatusRepository, VideoService, VideoResolver, VideoMapper, VideoDownloadService,
    TranscodingService, DownloadVideoJobHandler, VideoValidationJobHandler, VideoProcessorJobHandler]
})
export class VideosModule {
}
