import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { SLA_CHANNEL } from '@/src/api/sla/sla.constants';
import { ChannelRateLimitedError, NotificationChannel } from '@/src/api/sla/channels/notification-channel.interface';

@Injectable()
export class SlackChannel implements NotificationChannel {
  readonly name = SLA_CHANNEL.SLACK;

  constructor(private httpService: HttpService) {}

  isEnabled(): boolean {
    return !!AppConfigService.appConfig.SLA_SLACK_WEBHOOK_URL;
  }

  async send(payload: Record<string, any>): Promise<void> {
    try {
      // Axios rejects non-2xx responses and timeouts, so any failure throws.
      await firstValueFrom(
        this.httpService.post(AppConfigService.appConfig.SLA_SLACK_WEBHOOK_URL, payload, { timeout: 5000 })
      );
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const retryAfterSec = Number(err.response.headers?.['retry-after']) || 60;
        throw new ChannelRateLimitedError(retryAfterSec * 1000);
      }
      throw err;
    }
  }
}
