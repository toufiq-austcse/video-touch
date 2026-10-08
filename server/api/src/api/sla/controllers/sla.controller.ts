import { Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import mongoose, { FilterQuery } from 'mongoose';
import { InternalApiKeyGuard } from '@/src/api/sla/guards/internal-api-key.guard';
import { SlaMonitorService } from '@/src/api/sla/services/sla-monitor.service';
import { SlaAlertRepository } from '@/src/api/sla/repositories/sla-alert.repository';
import { SlaNotificationRepository } from '@/src/api/sla/repositories/sla-notification.repository';
import { SlaAlertDocument } from '@/src/api/sla/schemas/sla-alert.schema';
import { ListSlaAlertsQueryDto } from '@/src/api/sla/dto/list-sla-alerts-query.dto';
import { SLA_ALERTS_LIST_LIMIT } from '@/src/api/sla/sla.constants';

@ApiTags('sla')
@ApiHeader({ name: 'x-internal-api-key', required: true })
@UseGuards(InternalApiKeyGuard)
@Controller({ version: '1', path: 'sla' })
export class SlaController {
  constructor(
    private slaMonitorService: SlaMonitorService,
    private alertRepository: SlaAlertRepository,
    private notificationRepository: SlaNotificationRepository
  ) {}

  @Post('check')
  @HttpCode(200)
  @ApiOperation({ summary: 'Run one SLA check. Called by crontab every 5 minutes.' })
  async check() {
    return this.slaMonitorService.runCheck();
  }

  @Post('test-notification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send a [TEST] message to the SLA Slack channel' })
  async testNotification() {
    return this.slaMonitorService.sendTestNotification();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'List SLA alerts with their notification status' })
  async listAlerts(@Query() query: ListSlaAlertsQueryDto) {
    const filter: FilterQuery<SlaAlertDocument> = {};
    if (query.asset_id) {
      filter.asset_id = mongoose.Types.ObjectId(query.asset_id);
    }
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }

    const alerts = await this.alertRepository.list(filter, SLA_ALERTS_LIST_LIMIT);
    const notificationIds = [...new Set(alerts.map((alert) => alert.notification_id.toString()))].map((id) =>
      mongoose.Types.ObjectId(id)
    );
    const notifications = await this.notificationRepository.findByIds(notificationIds);
    const notificationsById = new Map(notifications.map((n) => [n._id.toString(), n]));

    return alerts.map((alert) => {
      const notification = notificationsById.get(alert.notification_id.toString());
      return {
        ...alert,
        notification: notification
          ? {
              kind: notification.kind,
              status: notification.status,
              attempts: notification.attempts,
              sent_at: notification.sent_at,
              next_attempt_at: notification.next_attempt_at,
              last_error: notification.last_error,
            }
          : null,
      };
    });
  }
}
