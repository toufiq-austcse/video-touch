import { Injectable } from '@nestjs/common';
import { Models } from 'video-touch-common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UploadService {
  constructor(@InjectQueue('upload-video') private uploadQueue: Queue) {}

  publishVideoUploadJob(fileId: string, name: string, assetId: string, height: number, width: number, type: string) {
    let jobModel: Models.FileUploadJobModel = {
      asset_id: assetId,
      file_id: fileId,
      height: height,
      width: width,
      type: type,
      size: 0,
      name: name,
    };
    return this.uploadQueue.add('sadi', jobModel);
  }
}
