import { Global, Module } from '@nestjs/common';
import { RabbitMQModule as MQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqService } from './service/rabbitmq.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Global()
@Module({
  imports: [
    MQModule.forRootAsync(MQModule, {
      inject: [AppConfigService],
      useFactory: () => {
        console.log('RABBIT_MQ_URL ', AppConfigService.appConfig.RABBIT_MQ_URL);
        return {
          uri: AppConfigService.appConfig.RABBIT_MQ_URL,
          connectionInitOptions: { wait: true },
          exchanges: [{ name: AppConfigService.appConfig.RABBIT_MQ_VIDEO_TOUCH_TOPIC_EXCHANGE, type: 'topic' }],
        };
      },
    }),
  ],
  providers: [RabbitMqService],
  exports: [RabbitMqService],
})
export class RabbitMQModule {}
