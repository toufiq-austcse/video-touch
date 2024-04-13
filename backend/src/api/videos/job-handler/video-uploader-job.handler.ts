import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { VideoUploadJobModel } from '@/src/api/videos/models/job.model';
import { S3ClientService } from '@/src/common/aws/s3/s3-client.service';
import { getLocalResolutionPath } from '@/src/common/utils';

@Injectable()
export class VideoUploaderJobHandler {
  constructor(private s3ClientService: S3ClientService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_360P_UPLOAD_VIDEO_QUEUE
  })
  public async handle360PUpload(msg: VideoUploadJobModel) {
    try {
      let localFilePath = getLocalResolutionPath(msg._id.toString(), 360);
      let uploadObj = this.s3ClientService.buildUploadObjModel(msg, localFilePath);
      console.log('360p video uploadObj:', uploadObj);
      let uploadRes = await this.s3ClientService.uploadObject(uploadObj, true);

      console.log('360p video uploaded:', uploadRes);
    } catch (e) {
      console.log('error in video 360p upload job handler', e);

    }


  }
}