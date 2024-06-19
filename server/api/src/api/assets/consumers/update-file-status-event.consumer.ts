import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { FileService } from '@/src/api/assets/services/file.service';
import { Models } from '@toufiq-austcse/video-touch-common';

@Injectable()
export class UpdateFileStatusEventConsumer {
  constructor(private fileService: FileService) {}

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_UPDATE_FILE_STATUS_QUEUE,
  })
  public async handle(msg: Models.UpdateFileStatusEventModel) {
    try {
      console.log('UpdateFileStatusEventConsumer', msg);
      await this.fileService.updateFileStatus(msg.file_id.toString(), msg.status, msg.details, msg.dir_size);
    } catch (e: any) {
      console.log('error in UpdateFileStatusEventConsumer', e);
    }
  }
}
