import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMqService {
  constructor(private ampqConnection: AmqpConnection) {}

  publish(exchange: string, routingKey: string, message: any, options?: amqplib.Options.Publish) {
    console.log('exchange ', exchange, 'routing key ', routingKey);
    try {
      this.ampqConnection.publish(exchange, routingKey, message, options);
    } catch (e) {
      console.log('sadi ');
    }
  }
}
