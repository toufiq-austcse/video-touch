import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AssetRepository } from '@/src/api/assets/repositories/asset.repository';
import { FileRepository } from '@/src/api/assets/repositories/file.repository';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';
import { UserService } from '@/src/api/auth/services/user.service';
import { SlaAlertRepository } from '@/src/api/sla/repositories/sla-alert.repository';
import { SlaNotificationRepository } from '@/src/api/sla/repositories/sla-notification.repository';
import { SlaNotificationDocument } from '@/src/api/sla/schemas/sla-notification.schema';
import { SlaAlertFormatterService } from '@/src/api/sla/services/sla-alert-formatter.service';
import { SlackChannel } from '@/src/api/sla/channels/slack.channel';
import { ChannelRateLimitedError } from '@/src/api/sla/channels/notification-channel.interface';
import { SlaCheckSummary } from '@/src/api/sla/models/sla-check-summary.model';
import { DeliveryResult } from '@/src/api/sla/models/delivery-result.model';
import { NotificationGroup } from '@/src/api/sla/models/notification-group.model';
import { SlaAlertContext } from '@/src/api/sla/models/sla-alert-context.model';
import {
  SLA_CHANNEL,
  SLA_DELIVERY_LEASE_MS,
  SLA_LAST_ERROR_MAX_LENGTH,
  SLA_NOTIFICATION_KIND,
  SLA_NOTIFICATION_STATUS,
  SLA_RETRY_BATCH_SIZE,
  SLA_TIER,
  slaRetryDelayMs,
} from '@/src/api/sla/sla.constants';

@Injectable()
export class SlaMonitorService implements OnModuleInit {
  constructor(
    private assetRepository: AssetRepository,
    private fileRepository: FileRepository,
    private userService: UserService,
    private alertRepository: SlaAlertRepository,
    private notificationRepository: SlaNotificationRepository,
    private formatter: SlaAlertFormatterService,
    private slackChannel: SlackChannel
  ) {}

  onModuleInit() {
    const config = AppConfigService.appConfig;
    if (!config.SLA_ALERTS_ENABLED) {
      console.log('SLA alerts are disabled in the configuration.');
      return;
    }
    if (!this.slackChannel.isEnabled()) {
      console.error('SLA alerts are enabled but SLA_SLACK_WEBHOOK_URL is not set.');
    }
    if (config.SLA_WARNING_THRESHOLD_MINUTES >= config.SLA_TARGET_MINUTES) {
      console.error('SLA_WARNING_THRESHOLD_MINUTES must be lower than SLA_TARGET_MINUTES.');
    }
  }

  /** One SLA check. Safe to run at any time and any number of times, including concurrently. */
  async runCheck(): Promise<SlaCheckSummary> {
    const config = AppConfigService.appConfig;
    if (!config.SLA_ALERTS_ENABLED) {
      return { skipped: true };
    }
    if (!this.slackChannel.isEnabled()) {
      throw new InternalServerErrorException('SLA alerts are enabled but SLA_SLACK_WEBHOOK_URL is not set');
    }

    const startedAt = Date.now();
    const now = new Date();

    // Step 1: retry notifications that failed on an earlier check.
    const retried = await this.retryDueNotifications(now);

    // Step 2: find assets past the warning threshold.
    const cutoff = new Date(now.getTime() - config.SLA_WARNING_THRESHOLD_MINUTES * 60_000);
    const lookback = new Date(now.getTime() - config.SLA_LOOKBACK_HOURS * 3_600_000);
    const candidates = await this.assetRepository.findSlaWarningCandidates(
      cutoff,
      lookback,
      config.SLA_CHECK_BATCH_LIMIT
    );

    // Step 3: claim them atomically; only the caller that sets the flag continues.
    const claimed: AssetDocument[] = [];
    for (const asset of candidates) {
      if (await this.assetRepository.claimSlaWarning(asset._id, now)) {
        claimed.push(asset);
      }
    }

    // Step 4: store alerts and the messages to send.
    const digest = claimed.length > config.SLA_DIGEST_THRESHOLD;
    const created = claimed.length ? await this.createNotifications(claimed, digest, now) : [];

    // Step 5: send.
    let sent = 0;
    let pending = 0;
    for (const notification of created) {
      const result = await this.deliver(notification, now);
      if (result === 'SENT') sent++;
      else if (result === 'PENDING') pending++;
    }

    const summary: SlaCheckSummary = {
      skipped: false,
      retried,
      tier: SLA_TIER.WARNING,
      candidates: candidates.length,
      claimed: claimed.length,
      notifications: { created: created.length, sent, pending },
      digest,
      duration_ms: Date.now() - startedAt,
    };
    console.log('SLA check summary', JSON.stringify(summary));
    return summary;
  }

  /** Sends a [TEST] message. Works whether or not SLA alerts are enabled, so the webhook can be checked first. */
  async sendTestNotification() {
    if (!this.slackChannel.isEnabled()) {
      throw new InternalServerErrorException('SLA_SLACK_WEBHOOK_URL is not set');
    }
    const now = new Date();
    const notification = await this.notificationRepository.insertWithId({
      _id: mongoose.Types.ObjectId(),
      channel: SLA_CHANNEL.SLACK,
      kind: SLA_NOTIFICATION_KIND.TEST,
      tier: SLA_TIER.WARNING,
      asset_ids: [],
      payload: this.formatter.buildTest(),
      status: SLA_NOTIFICATION_STATUS.PENDING,
      attempts: 0,
      next_attempt_at: now,
    });

    let result = await this.deliver(notification, now);
    if (result === 'PENDING') {
      // A test message must not be retried by later checks.
      await this.notificationRepository.markFailed(notification._id, 'test notification is not retried');
      result = 'FAILED';
    }
    return { notification_id: notification._id.toString(), status: result };
  }

  private async createNotifications(
    claimed: AssetDocument[],
    digest: boolean,
    now: Date
  ): Promise<SlaNotificationDocument[]> {
    const config = AppConfigService.appConfig;

    // Pre-assign notification ids (one for a digest, one per asset otherwise) so alerts can point at them
    // and duplicates can be dropped before anything is rendered.
    const digestId = mongoose.Types.ObjectId();
    const groups = new Map<string, NotificationGroup>();
    for (const asset of claimed) {
      const id = digest ? digestId : mongoose.Types.ObjectId();
      const key = id.toHexString();
      if (!groups.has(key)) {
        groups.set(key, { id, assets: [] });
      }
      groups.get(key)!.assets.push(asset);
    }
    const notificationIds = [...groups.values()].map((group) => group.id);

    try {
      for (const group of groups.values()) {
        const kept: AssetDocument[] = [];
        for (const asset of group.assets) {
          const inserted = await this.alertRepository.insertIfAbsent({
            asset_id: asset._id,
            user_id: asset.user_id,
            tier: SLA_TIER.WARNING,
            threshold_minutes: config.SLA_WARNING_THRESHOLD_MINUTES,
            asset_status_at_alert: asset.latest_status,
            sla_started_at: asset.sla!.started_at!,
            elapsed_minutes: this.elapsedMinutes(asset, now),
            notification_id: group.id,
          });
          if (inserted) {
            kept.push(asset);
          }
        }
        group.assets = kept;
      }

      const contexts = await this.loadContexts(
        [...groups.values()].flatMap((group) => group.assets),
        now
      );

      const created: SlaNotificationDocument[] = [];
      for (const group of groups.values()) {
        if (!group.assets.length) {
          continue;
        }
        const items = group.assets.map((asset) => contexts.get(asset._id.toHexString())!);
        const payload = digest
          ? this.formatter.buildDigest(items, config.SLA_WARNING_THRESHOLD_MINUTES)
          : this.formatter.buildSingle(items[0]!);
        created.push(
          await this.notificationRepository.insertWithId({
            _id: group.id,
            channel: SLA_CHANNEL.SLACK,
            kind: digest ? SLA_NOTIFICATION_KIND.DIGEST : SLA_NOTIFICATION_KIND.SINGLE,
            tier: SLA_TIER.WARNING,
            asset_ids: group.assets.map((asset) => asset._id),
            payload,
            status: SLA_NOTIFICATION_STATUS.PENDING,
            attempts: 0,
            next_attempt_at: now,
          })
        );
      }
      return created;
    } catch (err) {
      // Roll back so the next check retries these assets. Losing an alert is worse than a duplicate.
      console.error('SLA check failed after claiming assets, rolling back', err);
      await this.alertRepository.deleteByNotificationIds(notificationIds).catch(() => undefined);
      await this.notificationRepository.deleteByIds(notificationIds).catch(() => undefined);
      await this.assetRepository.releaseSlaWarning(claimed.map((asset) => asset._id)).catch(() => undefined);
      throw err;
    }
  }

  /** Loads files and owner emails for all assets with two queries in total. */
  private async loadContexts(assets: AssetDocument[], now: Date): Promise<Map<string, SlaAlertContext>> {
    const contexts = new Map<string, SlaAlertContext>();
    if (!assets.length) {
      return contexts;
    }

    const files =
      (await this.fileRepository.find(
        { asset_id: { $in: assets.map((asset) => asset._id) } },
        { asset_id: 1, type: 1, height: 1, latest_status: 1 }
      )) ?? [];
    const filesByAsset = new Map<string, SlaAlertContext['files']>();
    for (const file of files) {
      const key = file.asset_id.toString();
      if (!filesByAsset.has(key)) {
        filesByAsset.set(key, []);
      }
      filesByAsset.get(key)!.push({ type: file.type, height: file.height, latest_status: file.latest_status });
    }

    const userIds = [...new Set(assets.map((asset) => asset.user_id.toString()))].map((id) =>
      mongoose.Types.ObjectId(id)
    );
    const emails = await this.userService.findEmailsByIds(userIds);

    for (const asset of assets) {
      const key = asset._id.toHexString();
      contexts.set(key, {
        asset: {
          _id: asset._id,
          title: asset.title,
          latest_status: asset.latest_status,
          sla_started_at: asset.sla!.started_at!,
        },
        elapsedMinutes: this.elapsedMinutes(asset, now),
        ownerEmail: emails.get(asset.user_id.toString()),
        files: filesByAsset.get(key) ?? [],
      });
    }
    return contexts;
  }

  /** Takes a lease on the notification, sends it, and records the result. */
  private async deliver(notification: SlaNotificationDocument, now: Date): Promise<DeliveryResult> {
    const leased = await this.notificationRepository.lease(
      notification._id,
      notification.attempts,
      new Date(now.getTime() + SLA_DELIVERY_LEASE_MS)
    );
    if (!leased) {
      return 'SKIPPED'; // another check is sending it
    }

    try {
      await this.slackChannel.send(leased.payload);
      await this.notificationRepository.markSent(leased._id, new Date());
      return 'SENT';
    } catch (err: any) {
      const message = String(err?.message ?? err).slice(0, SLA_LAST_ERROR_MAX_LENGTH);
      if (leased.attempts >= AppConfigService.appConfig.SLA_MAX_DELIVERY_ATTEMPTS) {
        console.error(`SLA notification ${leased._id.toString()} failed permanently: ${message}`);
        await this.notificationRepository.markFailed(leased._id, message);
        return 'FAILED';
      }
      const delay = err instanceof ChannelRateLimitedError ? err.retryAfterMs : slaRetryDelayMs(leased.attempts);
      console.log(`SLA notification ${leased._id.toString()} failed, retrying in ${delay} ms: ${message}`);
      await this.notificationRepository.markRetry(leased._id, new Date(Date.now() + delay), message);
      return 'PENDING';
    }
  }

  private async retryDueNotifications(now: Date) {
    const due = await this.notificationRepository.findDue(now, SLA_RETRY_BATCH_SIZE);
    const result = { attempted: 0, sent: 0, failed: 0 };
    for (const notification of due) {
      const delivery = await this.deliver(notification, now);
      if (delivery === 'SKIPPED') {
        continue;
      }
      result.attempted++;
      if (delivery === 'SENT') result.sent++;
      if (delivery === 'FAILED') result.failed++;
    }
    return result;
  }

  private elapsedMinutes(asset: AssetDocument, now: Date): number {
    return Math.floor((now.getTime() - new Date(asset.sla!.started_at!).getTime()) / 60_000);
  }
}
