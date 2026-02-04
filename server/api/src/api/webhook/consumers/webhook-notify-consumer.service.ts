import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { WebhookNotifyConsumerDto } from '@/src/api/webhook/dto/webhook-notify-consumer.dto';
import { firstValueFrom } from 'rxjs';
import { WEBHOOOK_RESPONSE_STATUS } from '@/src/common/constants';
import { WebhookResponseService } from '@/src/api/webhook/services/webhook-response.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WebhookNotifyConsumer {
  constructor(private webhookResponseService: WebhookResponseService, private httpService: HttpService) {}

  @RabbitSubscribe({
    exchange: process.env.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE,
    routingKey: process.env.RABBIT_MQ_WEBHOOK_NOTIFY_ROUTING_KEY,
    queue: process.env.RABBIT_MQ_WEBHOOK_NOTIFY_CONSUMER_QUEUE,
  })
  public async handle(msg: WebhookNotifyConsumerDto) {
    try {
      console.log('WebhookPublisherConsumer', msg);

      let res = await firstValueFrom(
        this.httpService.post(msg.url, msg.payload, {
          headers: {
            'x-vdio-touch-key': msg.auth_token,
          },
          timeout: 5000,
        })
      );

      await this.webhookResponseService.create({
        user_id: msg.user_id,
        asset_id: msg.asset_id,
        webhook_id: msg.webhook_id,
        event_type: msg.payload.event_type,
        identification_type: msg.identification_type,
        identification_value: msg.identification_value,
        payload: msg.payload,
        status: WEBHOOOK_RESPONSE_STATUS.SUCCESS,
        responseBody: res.data,
      });
      console.log('Webhook sent successfully to ', msg.url);
    } catch (e: any) {
      console.log('error in UpdateFileStatusEventConsumer', e);
      this.webhookResponseService
        .create({
          user_id: msg.user_id,
          asset_id: msg.asset_id,
          webhook_id: msg.webhook_id,
          identification_type: msg.identification_type,
          identification_value: msg.identification_value,
          event_type: msg.payload.event_type,
          payload: msg.payload,
          status: WEBHOOOK_RESPONSE_STATUS.FAILED,
          responseBody: null,
          error: e,
        })
        .catch((err) => {
          console.log('error while logging webhook response', err);
        });
    }
  }
}
