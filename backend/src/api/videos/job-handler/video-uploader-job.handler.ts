import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoUploadJobModel } from '@/src/api/videos/models/job.model';
import { getDirSize, getLocalResolutionPath, getRefPlayListPath, getS3VideoPath } from '@/src/common/utils';
import { terminal } from '@/src/common/utils/terminal';
import { VideoRepository } from '@/src/api/videos/repositories/video.repository';
import { VideoService } from '@/src/api/videos/services/video.service';
import mongoose from 'mongoose';
import { VIDEO_STATUS } from '@/src/common/constants';

@Injectable()
export class VideoUploaderJobHandler {
  constructor(private videoRepository: VideoRepository, private videoService: VideoService) {
  }

  async syncDirToS3(localDir: string, s3Dir: string) {
    console.log('syncing dir to s3', localDir, s3Dir);

    let command = `aws s3 sync ${localDir}  ${s3Dir} --profile video-touch --acl public-read`;
    return terminal(command);
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE
  })
  public async handle360PUpload(msg: VideoUploadJobModel) {
    console.log('uploading 360p video', msg._id.toString());
    try {
      let video = await this.videoRepository.findOne({
        _id: mongoose.Types.ObjectId(msg._id.toString())
      });

      if (!video) {
        console.log('video not found');
        return;
      }

      let localFilePath = getLocalResolutionPath(msg._id.toString(), msg.height);
      let s3VideoPath = getS3VideoPath(msg._id.toString(), msg.height);
      let res = await this.syncDirToS3(localFilePath, s3VideoPath);
      console.log('video 360p uploaded:', res);

      let referencePlayListPath = getRefPlayListPath(msg._id.toString(), msg.height);
      let dirSize = await getDirSize(localFilePath);
      console.log('dir size:', dirSize);

      let renditionDoc = this.videoService.buildRenditionDocument(referencePlayListPath, msg.height, msg.width, dirSize);

      await this.videoRepository.pushRendition(msg._id.toString(), renditionDoc);
      if (video.latest_status !== VIDEO_STATUS.READY) {
        await this.videoService.insertVideoStatus(msg._id.toString(), VIDEO_STATUS.READY, 'Video is ready');
      }

    } catch (e) {
      console.log('error in video 360p upload job handler', e);

    }

  }
}