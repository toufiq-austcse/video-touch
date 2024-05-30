import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { AssetService } from '@/src/api/assets/services/asset.service';
import { UpdateAssetStatusEventModel } from '@/src/api/assets/models/event.model';

@Injectable()
export class UpdateAssetStatusEventConsumer {
  constructor(private assetService: AssetService) {
  }

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_UPDATE_ASSET_STATUS_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_UPDATE_ASSET_STATUS_QUEUE
  })
  public async handle(msg: UpdateAssetStatusEventModel) {
    try {
      console.log('UpdateAssetStatusEventConsumer', msg);
      await this.assetService.updateAssetStatus(msg.asset_id, msg.status, msg.details);
    } catch (e: any) {
      console.log('error in UpdateAssetStatusEventConsumer', e);
    }
  }
}
