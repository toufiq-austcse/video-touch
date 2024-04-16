import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ASSET_COLLECTION_NAME, VideoSchema } from './schemas/assets.schema';
import { AssetRepository } from './repositories/asset.repository';
import { AssetService } from './services/asset.service';
import { VideoResolver } from './resolvers/video.resolver';
import { VideoMapper } from '@/src/api/videos/mapper/video.mapper';

import { ModuleRef } from '@nestjs/core';
import { VIDEO_STATUS } from '@/src/common/constants';
import { VideoDownloadService } from '@/src/api/videos/services/video-download.service';
import { DownloadVideoJobHandler } from '@/src/api/videos/job-handler/download-video-job.handler';
import { VideoValidationJobHandler } from '@/src/api/videos/job-handler/video-validation-job.handler';
import { VideoProcessorJobHandler } from '@/src/api/videos/job-handler/video-processer-job.handler';
import { TranscodingService } from '@/src/api/videos/services/transcoding.service';
import { VideoUploaderJobHandler } from '@/src/api/videos/job-handler/video-uploader-job.handler';
import { JobManagerService } from '@/src/api/videos/services/job-manager.service';
import { FILE_COLLECTION_NAME, FileSchema } from '@/src/api/videos/schemas/files.schema';
import { StatusMapper } from '@/src/api/videos/mapper/status.mapper';
import { FileRepository } from '@/src/api/videos/repositories/file.repository';
import { FileService } from '@/src/api/videos/services/file.service';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ASSET_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = VideoSchema;
          schema.pre('save', async function() {
            console.log('videos pre save hook');
            const video = this;
            (video as any).latest_status = VIDEO_STATUS.QUEUED;
            (video as any).status_logs = StatusMapper.mapForSave(VIDEO_STATUS.QUEUED, 'Video is queued');

          });
          schema.post('save', async function() {
            let assetService = moduleRef.get<AssetService>(AssetService, { strict: false });
            console.log('post save hook');
            const video: any = this;

            assetService.pushDownloadVideoJob(video).then(() => {
              console.log('pushed download videos job');
            }).catch(err => {
              console.log('error pushing download videos job', err);
            });
            return;
          });
          return schema;
        }
      },
      // {
      //   name: FILE_COLLECTION_NAME,
      //   inject: [ModuleRef],
      //   useFactory: (moduleRef: ModuleRef) => {
      //     let schema = FileSt;
      //
      //     schema.post('save', async function() {
      //       let videoRepository = moduleRef.get<AssetRepository>(AssetRepository, { strict: false });
      //
      //       console.log('post save hook called in videos status schema');
      //
      //       const videoStatus: any = this;
      //       await videoRepository.findOneAndUpdate({
      //         _id: mongoose.Types.ObjectId(videoStatus.video_id)
      //       }, {
      //         latest_status: videoStatus.status
      //       });
      //       console.log('updated videos status');
      //
      //       return;
      //     });
      //
      //     return schema;
      //   }
      // },
      {
        name: FILE_COLLECTION_NAME,
        useFactory: () => {
          return FileSchema;
        }
      }
    ])
  ],
  providers: [AssetRepository, FileRepository, AssetService, VideoResolver, VideoMapper, VideoDownloadService, FileService,
    TranscodingService, DownloadVideoJobHandler, VideoValidationJobHandler, VideoProcessorJobHandler, VideoUploaderJobHandler, JobManagerService]
})
export class VideosModule {
}
