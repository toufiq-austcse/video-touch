import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsModule } from '@/src/api/assets/assets.module';
import { AuthModule } from '@/src/api/auth/auth.module';
import { SLA_ALERT_COLLECTION_NAME, SLA_NOTIFICATION_COLLECTION_NAME } from '@/src/api/sla/sla.constants';
import { SlaAlertSchema } from '@/src/api/sla/schemas/sla-alert.schema';
import { SlaNotificationSchema } from '@/src/api/sla/schemas/sla-notification.schema';
import { SlaAlertRepository } from '@/src/api/sla/repositories/sla-alert.repository';
import { SlaNotificationRepository } from '@/src/api/sla/repositories/sla-notification.repository';
import { SlaAlertFormatterService } from '@/src/api/sla/services/sla-alert-formatter.service';
import { SlaMonitorService } from '@/src/api/sla/services/sla-monitor.service';
import { SlackChannel } from '@/src/api/sla/channels/slack.channel';
import { InternalApiKeyGuard } from '@/src/api/sla/guards/internal-api-key.guard';
import { SlaController } from '@/src/api/sla/controllers/sla.controller';

// Deliberately no BullModule / RabbitMQModule: SLA alerting must keep working while Redis is down.
@Module({
  imports: [
    HttpModule,
    AssetsModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: SLA_ALERT_COLLECTION_NAME, schema: SlaAlertSchema },
      { name: SLA_NOTIFICATION_COLLECTION_NAME, schema: SlaNotificationSchema },
    ]),
  ],
  controllers: [SlaController],
  providers: [
    SlaAlertRepository,
    SlaNotificationRepository,
    SlaAlertFormatterService,
    SlackChannel,
    SlaMonitorService,
    InternalApiKeyGuard,
  ],
})
export class SlaModule {}
