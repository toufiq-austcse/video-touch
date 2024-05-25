import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { UpdateAssetEventModel } from '@/src/api/assets/models/job.model';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import mongoose from 'mongoose';

@Injectable()
export class UpdateAssetEventConsumer {
  constructor(private assetRepository: AssetRepository) {}

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_UPDATE_ASSET_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_UPDATE_ASSET_QUEUE,
  })
  public async handle(msg: UpdateAssetEventModel) {
    try {
      console.log('UpdateAssetStatusEventConsumer', msg);
      await this.assetRepository.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(msg.asset_id),
        },
        {
          size: msg.data.size,
          height: msg.data.height,
          width: msg.data.width,
          duration: msg.data.duration,
        }
      );
    } catch (e: any) {
      console.log('error in UpdateAssetStatusEventConsumer', e);
    }
  }
}
