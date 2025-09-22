import { Injectable } from '@nestjs/common';
import { RabbitMqService } from '@/src/common/rabbit-mq/service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Models } from 'video-touch-common';

@Injectable()
export class FileStatusPublisher {
  constructor(private rabbitMqService: RabbitMqService) {}

  publishUpdateFileStatusEvent(fileId: string, details: string, dirSize: number, status: string) {
    try {
      let updateFileStatusEvent = this.buildUpdateFileStatusEventModel(fileId, details, dirSize, status);
      this.rabbitMqService.publish(
        AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
        AppConfigService.appConfig.RABBIT_MQ_UPDATE_FILE_STATUS_ROUTING_KEY,
        updateFileStatusEvent,
      );
    } catch (e) {
      console.log('error while publishing update file status event', e);
    }
  }

  buildUpdateFileStatusEventModel(
    fileId: string,
    details: string,
    dirSize: number,
    status: string,
  ): Models.UpdateFileStatusEventModel {
    return {
      file_id: fileId,
      details: details,
      dir_size: dirSize,
      status: status,
    };
  }
}
