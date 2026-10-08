# Implementation Spec: Video Processing SLA Alerting

| | |
|---|---|
| Status | Ready for implementation |
| Design spec | [`video-sla-alerting.md`](./video-sla-alerting.md) |
| Service | `server/api` only |
| Delivery | 2 PRs (§3) |

This document turns the design spec into concrete code changes: which files to create or edit, in what order, with code skeletons and the checks that prove each step works. When this document and the design spec disagree, this one wins; every difference is listed in §2.

## 1. Codebase facts that shape the implementation

Check these before writing code. Several of them change how the design spec has to be built.

| Fact | Where | Consequence |
|---|---|---|
| **Mongoose is 5.13.23** | `server/api/package.json` | `updateOne`/`updateMany` return `{ n, nModified, ok }`, **not** `{ matchedCount, modifiedCount }`. Check claims with `res.nModified === 1`. Build ObjectIds with `mongoose.Types.ObjectId(id)` (no `new`), as the rest of the code does. |
| **`BaseRepository.create()` always overwrites `_id`** | `src/common/database/repository/base.repository.ts` | It spreads the document and then sets `_id: new Types.ObjectId()`. The SLA code needs to choose IDs up front (§5.6), so the SLA repositories add their own `insertWithId()`/`insertMany()` that call the model directly. |
| **`AssetsModule` exports nothing** | `src/api/assets/assets.module.ts` | Add `exports: [AssetRepository, FileRepository]` so `SlaModule` can use them. |
| **`AuthModule` only exports `UserService`**, which has no "find by IDs" method | `src/api/auth/services/user.service.ts` | Add `findEmailsByIds()` to `UserService` for the "Owner" line in Slack messages. |
| **Config is a static object** | `AppConfigService.appConfig` | Services read `AppConfigService.appConfig.X`; nothing injects `ConfigService` directly. Follow that pattern. |
| **The asset post-hook only listens to `findOneAndUpdate`** | `assets.module.ts`, `schema.post('findOneAndUpdate')` | Any write through `updateOne`/`updateMany` on assets is invisible to the hook. Every SLA write to `assets` uses `updateOne`/`updateMany` on purpose, so it can't trigger `afterUpdateLatestStatus` or webhooks. |
| **`tsconfig` is strict-ish** | `noUnusedLocals`, `noUncheckedIndexedAccess`, `noImplicitReturns` | Array indexing returns `T \| undefined`; unused imports fail the build. |
| **Routes are `/api/v{n}/...`** | `main.ts`: `setGlobalPrefix('api')` + URI versioning | `@Controller({ version: '1', path: 'sla' })` gives `/api/v1/sla/...`. |

## 2. Differences from the design spec

| Design spec | Implementation | Why |
|---|---|---|
| `SlaClockService` is a provider in `SlaModule` (§7) | Plain exported functions in `src/api/sla/sla-clock.ts` | `AssetService` (in `AssetsModule`) has to call it, and `SlaModule` imports `AssetsModule`. A provider would create a circular module dependency. |
| Overlapping retries are blocked by "a filter on `attempts`" (§8.4) | A **lease**: atomically bump `attempts` and push `next_attempt_at` 2 minutes ahead **before** calling Slack (§5.7) | Filtering only when writing the result would still let two checks both call Slack. Taking the lease first means only one of them sends. |
| On insert failure, roll back the claim (§8.2 step 4) | Roll back the claim **and delete any `sla_alerts` rows already written** for those assets | Otherwise the unique index on `sla_alerts` would block the asset from ever being alerted again. |
| Alerts reference a notification created first (§8.2 step 4) | Notification IDs are generated up front; alerts are inserted first, then notifications | Duplicate alerts (E11000) can then be dropped **before** the message is rendered, so a message never lists an asset that was already alerted. |

## 3. Delivery plan

| PR | Contents | Can merge alone? |
|---|---|---|
| **PR 1: Clock + config** | §4 (config, schema, clock logic) | Yes. Nothing alerts; `sla.started_at` starts filling in for new assets (design §12 step 1). |
| **PR 2: SLA module + endpoint + script** | §5 and §6 | Yes, with `SLA_ALERTS_ENABLED=false` (the default). |

Commit messages must follow Conventional Commits (commitlint runs in the `commit-msg` hook), for example `feat(sla): start sla clock on downloading`.

---

## 4. PR 1: Clock and config

### 4.1 Configuration

**Edit `src/common/app-config/environment.ts`**, adding to `EnvironmentVariables`:

```ts
SLA_ALERTS_ENABLED: boolean;
SLA_TARGET_MINUTES: number;
SLA_WARNING_THRESHOLD_MINUTES: number;
SLA_LOOKBACK_HOURS: number;
SLA_CHECK_BATCH_LIMIT: number;
SLA_DIGEST_THRESHOLD: number;
SLA_MAX_DELIVERY_ATTEMPTS: number;
SLA_SLACK_WEBHOOK_URL?: string;
INTERNAL_API_KEY?: string;
```

**Edit `src/common/app-config/service/app-config.service.ts`.** Use `get` with defaults, never `getOrThrow`, so the API boots without any SLA config:

```ts
SLA_ALERTS_ENABLED: this.configService.get('SLA_ALERTS_ENABLED', 'false') === 'true',
SLA_TARGET_MINUTES: +this.configService.get('SLA_TARGET_MINUTES', 60),
SLA_WARNING_THRESHOLD_MINUTES: +this.configService.get('SLA_WARNING_THRESHOLD_MINUTES', 30),
SLA_LOOKBACK_HOURS: +this.configService.get('SLA_LOOKBACK_HOURS', 24),
SLA_CHECK_BATCH_LIMIT: +this.configService.get('SLA_CHECK_BATCH_LIMIT', 500),
SLA_DIGEST_THRESHOLD: +this.configService.get('SLA_DIGEST_THRESHOLD', 5),
SLA_MAX_DELIVERY_ATTEMPTS: +this.configService.get('SLA_MAX_DELIVERY_ATTEMPTS', 5),
SLA_SLACK_WEBHOOK_URL: this.configService.get('SLA_SLACK_WEBHOOK_URL'),
INTERNAL_API_KEY: this.configService.get('INTERNAL_API_KEY'),
```

**Edit `server/example.env`**, appending:

```env
# SLA alerting (see specs/video-sla-alerting.md)
SLA_ALERTS_ENABLED=false
SLA_TARGET_MINUTES=60
SLA_WARNING_THRESHOLD_MINUTES=30
SLA_LOOKBACK_HOURS=24
SLA_CHECK_BATCH_LIMIT=500
SLA_DIGEST_THRESHOLD=5
SLA_MAX_DELIVERY_ATTEMPTS=5
SLA_SLACK_WEBHOOK_URL=
INTERNAL_API_KEY=
```

### 4.2 Asset schema

**Create `src/api/assets/schemas/sla.schema.ts`:**

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AssetSlaDocument {
  @Prop({ required: false })
  started_at?: Date;

  @Prop({ required: false })
  warning_alerted_at?: Date;
}

export const AssetSlaSchema = SchemaFactory.createForClass(AssetSlaDocument);
```

**Edit `src/api/assets/schemas/assets.schema.ts`:**

```ts
import { AssetSlaDocument, AssetSlaSchema } from '@/src/api/assets/schemas/sla.schema';

// inside AssetDocument
@Prop({ required: false, type: AssetSlaSchema, default: undefined })
sla?: AssetSlaDocument;

// after `export const VideoSchema = SchemaFactory.createForClass(AssetDocument);`
VideoSchema.index(
  { 'sla.started_at': 1, latest_status: 1 },
  { partialFilterExpression: { 'sla.started_at': { $exists: true } } }
);
```

Mongoose builds the index on startup (`autoIndex` is on by default). The index is partial, so it covers only new assets and builds quickly on an existing collection.

### 4.3 Clock helpers

**Create `src/api/sla/sla-clock.ts`.** These are plain functions, not a provider (see §2):

```ts
import { UpdateQuery } from 'mongoose';
import { Constants } from 'video-touch-common';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';

/** The only status that starts the SLA clock. Add UPLOADED here when tus uploads come back. */
export function shouldStartSlaClock(status: string): boolean {
  return status === Constants.VIDEO_STATUS.DOWNLOADING;
}

/** Statuses that clear the clock so the next DOWNLOADING starts a fresh one. */
export function shouldResetSlaClock(status: string): boolean {
  return status === Constants.VIDEO_STATUS.RE_PROCESSING;
}

export function buildSlaResetUnset(): UpdateQuery<AssetDocument>['$unset'] {
  return { 'sla.started_at': '', 'sla.warning_alerted_at': '' };
}
```

### 4.4 Repository methods

**Edit `src/api/assets/repositories/asset.repository.ts`**, adding:

```ts
import { Constants } from 'video-touch-common';

/** Starts the clock only if it isn't already running. updateOne: does not fire the asset post-hook. */
async startSlaClock(assetId: string, at: Date) {
  return this.videoModel.updateOne(
    { _id: mongoose.Types.ObjectId(assetId), 'sla.started_at': { $exists: false } },
    { $set: { 'sla.started_at': at } }
  );
}

async findSlaWarningCandidates(cutoff: Date, lookback: Date, limit: number): Promise<AssetDocument[]> {
  return this.videoModel
    .find(
      {
        is_deleted: { $ne: true },
        'sla.started_at': { $lte: cutoff, $gte: lookback },
        latest_status: { $ne: Constants.VIDEO_STATUS.READY },
        'sla.warning_alerted_at': { $exists: false },
      },
      { _id: 1, user_id: 1, title: 1, latest_status: 1, sla: 1 }
    )
    .sort({ 'sla.started_at': 1 })
    .limit(limit)
    .lean();
}

/** Atomic claim. Returns true only for the caller that set the flag. */
async claimSlaWarning(assetId: mongoose.Types.ObjectId, at: Date): Promise<boolean> {
  const res = await this.videoModel.updateOne(
    {
      _id: assetId,
      'sla.warning_alerted_at': { $exists: false },
      latest_status: { $ne: Constants.VIDEO_STATUS.READY },
    },
    { $set: { 'sla.warning_alerted_at': at } }
  );
  return res.nModified === 1; // Mongoose 5 result shape
}

async releaseSlaWarning(assetIds: mongoose.Types.ObjectId[]) {
  return this.videoModel.updateMany({ _id: { $in: assetIds } }, { $unset: { 'sla.warning_alerted_at': '' } });
}
```

### 4.5 `AssetService.updateAssetStatus`

**Edit `src/api/assets/services/asset.service.ts`.** Keep the current filter and return value, because callers depend on them:

```ts
import { UpdateQuery } from 'mongoose';
import { buildSlaResetUnset, shouldResetSlaClock, shouldStartSlaClock } from '@/src/api/sla/sla-clock';

async updateAssetStatus(videoId: string, status: string, details: string) {
  const update: UpdateQuery<AssetDocument> = {
    latest_status: status,
    $push: { status_logs: { status, details } },
  };
  if (shouldResetSlaClock(status)) {
    update.$unset = buildSlaResetUnset();
  }

  const result = await this.repository.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(videoId), latest_status: { $ne: status } },
    update
  );

  if (shouldStartSlaClock(status)) {
    try {
      await this.repository.startSlaClock(videoId, new Date());
    } catch (err) {
      // Never let SLA bookkeeping break the pipeline.
      console.log('error while starting sla clock ', err);
    }
  }

  return result;
}
```

Notes:
- `latest_status` stays a top-level key. Mongoose moves it into `$set`, which is what the post-hook reads (`this['_update']['$set']['latest_status']`). Adding `$unset` doesn't change that, but check it manually after the change (§8, PR 1).
- `startSlaClock` runs after the status update and isn't conditional on `result`. Its `$exists: false` filter already makes it a no-op when the clock is running.

---

## 5. PR 2: SLA module

### 5.1 Files

```
src/api/sla/
  sla-clock.ts                         (from PR 1)
  sla.constants.ts
  sla.module.ts
  schemas/
    sla-alert.schema.ts
    sla-notification.schema.ts
  repositories/
    sla-alert.repository.ts
    sla-notification.repository.ts
  channels/
    notification-channel.interface.ts
    slack.channel.ts
  services/
    sla-alert-formatter.service.ts
    sla-monitor.service.ts
  guards/
    internal-api-key.guard.ts
  controllers/
    sla.controller.ts
  dto/
    list-sla-alerts-query.dto.ts
  models/
    sla-check-summary.model.ts
    delivery-result.model.ts
    notification-group.model.ts
    sla-alert-context.model.ts
```

Shared types live in `models/`, one per file, not inside the service files.

### 5.2 Constants

**`sla.constants.ts`:**

```ts
export const SLA_TIER = { WARNING: 'WARNING' } as const;
export type SlaTier = typeof SLA_TIER[keyof typeof SLA_TIER];

export const SLA_CHANNEL = { SLACK: 'SLACK' } as const;
export type SlaChannelName = typeof SLA_CHANNEL[keyof typeof SLA_CHANNEL];

export const SLA_NOTIFICATION_KIND = { SINGLE: 'SINGLE', DIGEST: 'DIGEST', TEST: 'TEST' } as const;
export type SlaNotificationKind = typeof SLA_NOTIFICATION_KIND[keyof typeof SLA_NOTIFICATION_KIND];

export const SLA_NOTIFICATION_STATUS = { PENDING: 'PENDING', SENT: 'SENT', FAILED: 'FAILED' } as const;
export type SlaNotificationStatus = typeof SLA_NOTIFICATION_STATUS[keyof typeof SLA_NOTIFICATION_STATUS];

export const SLA_ALERT_COLLECTION_NAME = 'sla_alerts';
export const SLA_NOTIFICATION_COLLECTION_NAME = 'sla_notifications';

export const SLA_RETRY_BATCH_SIZE = 20;
export const SLA_DELIVERY_LEASE_MS = 2 * 60 * 1000;
export const SLA_DIGEST_MAX_ROWS = 20;
export const SLA_LAST_ERROR_MAX_LENGTH = 1024;

/** Backoff after the Nth failed attempt (1-based): 5, 10, 20, 40 minutes. */
export function slaRetryDelayMs(failedAttempts: number): number {
  return 5 * 60 * 1000 * 2 ** Math.max(0, failedAttempts - 1);
}
```

### 5.3 Schemas

**`schemas/sla-alert.schema.ts`:**

```ts
@Schema({ timestamps: true, collection: SLA_ALERT_COLLECTION_NAME })
export class SlaAlertDocument extends AbstractDocument {
  @Prop({ required: true, type: Types.ObjectId, index: true }) asset_id: Types.ObjectId;
  @Prop({ required: true, type: Types.ObjectId }) user_id: Types.ObjectId;
  @Prop({ required: true, type: String }) tier: SlaTier;
  @Prop({ required: true }) threshold_minutes: number;
  @Prop({ required: true }) asset_status_at_alert: string;
  @Prop({ required: true }) sla_started_at: Date;
  @Prop({ required: true }) elapsed_minutes: number;
  @Prop({ required: true, type: Types.ObjectId, index: true }) notification_id: Types.ObjectId;
}
export const SlaAlertSchema = SchemaFactory.createForClass(SlaAlertDocument);
SlaAlertSchema.index({ asset_id: 1, tier: 1, sla_started_at: 1 }, { unique: true });
```

**`schemas/sla-notification.schema.ts`:**

```ts
@Schema({ timestamps: true, collection: SLA_NOTIFICATION_COLLECTION_NAME })
export class SlaNotificationDocument extends AbstractDocument {
  @Prop({ required: true, type: String }) channel: SlaChannelName;
  @Prop({ required: true, type: String }) kind: SlaNotificationKind;
  @Prop({ required: true, type: String }) tier: SlaTier;
  @Prop({ required: true, type: [Types.ObjectId], default: [] }) asset_ids: Types.ObjectId[];
  @Prop({ required: true, type: Object }) payload: Record<string, any>;
  @Prop({ required: true, type: String }) status: SlaNotificationStatus;
  @Prop({ required: true, default: 0 }) attempts: number;
  @Prop({ required: false }) next_attempt_at?: Date;
  @Prop({ required: false }) last_error?: string;
  @Prop({ required: false }) sent_at?: Date;
}
export const SlaNotificationSchema = SchemaFactory.createForClass(SlaNotificationDocument);
SlaNotificationSchema.index({ status: 1, next_attempt_at: 1 });
```

The props typed with aliases like `SlaTier` set `type: String` explicitly, so the Mongoose type never depends on what `emitDecoratorMetadata` infers from the TypeScript type. If a union is ever widened to mixed types, it would otherwise silently become `Mixed`.

### 5.4 Repositories

Both extend `BaseRepository` and add methods that call the model directly, because `BaseRepository.create()` overwrites `_id` (§1).

**`repositories/sla-alert.repository.ts`:**

```ts
@Injectable()
export class SlaAlertRepository extends BaseRepository<SlaAlertDocument> {
  constructor(@InjectModel(SLA_ALERT_COLLECTION_NAME) private model: Model<SlaAlertDocument>) {
    super(model);
  }

  /** Inserts one alert. Returns false on duplicate key (E11000); rethrows anything else. */
  async insertIfAbsent(doc: Omit<SlaAlertDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      await this.model.create({ ...doc, _id: mongoose.Types.ObjectId() });
      return true;
    } catch (err: any) {
      if (err?.code === 11000) return false;
      throw err;
    }
  }

  async deleteByNotificationIds(ids: Types.ObjectId[]) {
    return this.model.deleteMany({ notification_id: { $in: ids } });
  }

  async list(filter: FilterQuery<SlaAlertDocument>, limit: number) {
    return this.model.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
```

**`repositories/sla-notification.repository.ts`:**

```ts
@Injectable()
export class SlaNotificationRepository extends BaseRepository<SlaNotificationDocument> {
  constructor(@InjectModel(SLA_NOTIFICATION_COLLECTION_NAME) private model: Model<SlaNotificationDocument>) {
    super(model);
  }

  async insertWithId(doc: SlaNotificationDocument): Promise<SlaNotificationDocument> {
    return (await this.model.create(doc)).toJSON() as SlaNotificationDocument;
  }

  async findDue(now: Date, limit: number) {
    return this.model
      .find({ status: SLA_NOTIFICATION_STATUS.PENDING, next_attempt_at: { $lte: now } })
      .sort({ next_attempt_at: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Lease: only one caller can move a notification from `attempts = n` to `n + 1`.
   * Returns the leased document, or null if another check got it first.
   */
  async lease(id: Types.ObjectId, expectedAttempts: number, leaseUntil: Date) {
    return this.model
      .findOneAndUpdate(
        { _id: id, status: SLA_NOTIFICATION_STATUS.PENDING, attempts: expectedAttempts },
        { $inc: { attempts: 1 }, $set: { next_attempt_at: leaseUntil } },
        { new: true }
      )
      .lean();
  }

  async markSent(id: Types.ObjectId, at: Date) {
    return this.model.updateOne(
      { _id: id },
      { $set: { status: SLA_NOTIFICATION_STATUS.SENT, sent_at: at }, $unset: { next_attempt_at: '', last_error: '' } }
    );
  }

  async markRetry(id: Types.ObjectId, nextAttemptAt: Date, error: string) {
    return this.model.updateOne({ _id: id }, { $set: { next_attempt_at: nextAttemptAt, last_error: error } });
  }

  async markFailed(id: Types.ObjectId, error: string) {
    return this.model.updateOne(
      { _id: id },
      { $set: { status: SLA_NOTIFICATION_STATUS.FAILED, last_error: error }, $unset: { next_attempt_at: '' } }
    );
  }

  async deleteByIds(ids: Types.ObjectId[]) {
    return this.model.deleteMany({ _id: { $in: ids } });
  }

  async findByIds(ids: Types.ObjectId[]) {
    return this.model.find({ _id: { $in: ids } }, { payload: 0 }).lean();
  }
}
```

### 5.5 Slack channel

**`channels/notification-channel.interface.ts`:**

```ts
export interface NotificationChannel {
  readonly name: SlaChannelName;
  isEnabled(): boolean;
  /** Throws on failure. Throws ChannelRateLimitedError when the provider asks us to slow down. */
  send(payload: Record<string, any>): Promise<void>;
}

export class ChannelRateLimitedError extends Error {
  constructor(public readonly retryAfterMs: number) {
    super(`rate limited, retry after ${retryAfterMs} ms`);
  }
}
```

**`channels/slack.channel.ts`:**

```ts
@Injectable()
export class SlackChannel implements NotificationChannel {
  readonly name = SLA_CHANNEL.SLACK;

  constructor(private httpService: HttpService) {}

  isEnabled(): boolean {
    return !!AppConfigService.appConfig.SLA_SLACK_WEBHOOK_URL;
  }

  async send(payload: Record<string, any>): Promise<void> {
    try {
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
```

Axios rejects non-2xx responses by default, so any non-2xx response or timeout throws.

### 5.6 Formatter

**`services/sla-alert-formatter.service.ts`** builds Slack Block Kit payloads. It has no I/O; the monitor service passes the data in.

```ts
export interface SlaAlertContext {
  asset: Pick<AssetDocument, '_id' | 'title' | 'latest_status'> & { sla_started_at: Date };
  elapsedMinutes: number;
  ownerEmail?: string;
  files: Pick<FileDocument, 'type' | 'height' | 'latest_status'>[];
}

@Injectable()
export class SlaAlertFormatterService {
  buildSingle(ctx: SlaAlertContext): Record<string, any> { /* see layout below */ }
  buildDigest(items: SlaAlertContext[], thresholdMinutes: number): Record<string, any> { /* see layout below */ }
  buildTest(): Record<string, any> {
    return { text: '[TEST] Video Touch SLA alerts are connected to this channel.' };
  }
}
```

**Single** (design §9): `text` fallback plus blocks:
- header: `:warning: SLA warning: video not ready after {elapsed} min (SLA {SLA_TARGET_MINUTES} min)`
- section fields: Title, Asset ID, Status, Started (UTC, `toISOString()` cut to minutes), Time left (`max(0, target − elapsed)` min), Owner
- section: Files, formatted as `360p READY, 720p PROCESSING, thumbnail READY`. For `playlist` files show `{height}p`; for other types show the `type` value. Skip `partial_transcript`.

**Digest:** header `:rotating_light: {n} videos not ready after {threshold} min (SLA {target} min). Possible systemic issue`, then one section of up to `SLA_DIGEST_MAX_ROWS` lines `` `title` | asset_id | status | elapsed min ``, then `…and {n − 20} more` when the list is longer.

Escape `&`, `<` and `>` in titles (Slack mrkdwn), and cut titles to 80 characters.

### 5.7 Monitor service

**`services/sla-monitor.service.ts`** holds all the logic. Each step below matches design §8.2.

```ts
export interface SlaCheckSummary {
  skipped: boolean;
  retried?: { attempted: number; sent: number; failed: number };
  tier?: SlaTier;
  candidates?: number;
  claimed?: number;
  notifications?: { created: number; sent: number; pending: number };
  digest?: boolean;
  duration_ms?: number;
}

type DeliveryResult = 'SENT' | 'PENDING' | 'FAILED' | 'SKIPPED';

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
    const c = AppConfigService.appConfig;
    if (!c.SLA_ALERTS_ENABLED) return;
    if (!this.slackChannel.isEnabled()) console.error('SLA alerts enabled but SLA_SLACK_WEBHOOK_URL is not set');
    if (c.SLA_WARNING_THRESHOLD_MINUTES >= c.SLA_TARGET_MINUTES)
      console.error('SLA_WARNING_THRESHOLD_MINUTES must be lower than SLA_TARGET_MINUTES');
  }

  async runCheck(): Promise<SlaCheckSummary> {
    const c = AppConfigService.appConfig;
    if (!c.SLA_ALERTS_ENABLED) return { skipped: true };
    if (!this.slackChannel.isEnabled()) {
      throw new InternalServerErrorException('SLA alerts are enabled but SLA_SLACK_WEBHOOK_URL is not set');
    }

    const startedAt = Date.now();
    const now = new Date();

    // Step 1: retry due notifications
    const retried = await this.retryDueNotifications(now);

    // Step 2: candidates
    const cutoff = new Date(now.getTime() - c.SLA_WARNING_THRESHOLD_MINUTES * 60_000);
    const lookback = new Date(now.getTime() - c.SLA_LOOKBACK_HOURS * 3_600_000);
    const candidates = await this.assetRepository.findSlaWarningCandidates(cutoff, lookback, c.SLA_CHECK_BATCH_LIMIT);

    // Step 3: claim
    const claimed: AssetDocument[] = [];
    for (const asset of candidates) {
      if (await this.assetRepository.claimSlaWarning(asset._id, now)) claimed.push(asset);
    }

    // Step 4: build + store
    const digest = claimed.length > c.SLA_DIGEST_THRESHOLD;
    const created = claimed.length ? await this.createNotifications(claimed, digest, now) : [];

    // Step 5: send
    let sent = 0;
    let pending = 0;
    for (const n of created) {
      const r = await this.deliver(n, now);
      if (r === 'SENT') sent++;
      else if (r === 'PENDING') pending++;
    }

    // Step 6: summary
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
```

**`createNotifications`**: alerts first, then notifications, rolling back on failure:

```ts
  private async createNotifications(claimed: AssetDocument[], digest: boolean, now: Date) {
    const c = AppConfigService.appConfig;

    // 1. Pre-assign notification IDs: one for a digest, one per asset otherwise.
    const digestId = mongoose.Types.ObjectId();
    const groups = new Map<string, { id: Types.ObjectId; assets: AssetDocument[] }>();
    for (const asset of claimed) {
      const id = digest ? digestId : mongoose.Types.ObjectId();
      const key = id.toHexString();
      if (!groups.has(key)) groups.set(key, { id, assets: [] });
      groups.get(key)!.assets.push(asset);
    }
    const notificationIds = [...groups.values()].map((g) => g.id);

    try {
      // 2. Insert alerts; drop duplicates (already alerted).
      for (const group of groups.values()) {
        const kept: AssetDocument[] = [];
        for (const asset of group.assets) {
          const inserted = await this.alertRepository.insertIfAbsent({
            asset_id: asset._id,
            user_id: asset.user_id,
            tier: SLA_TIER.WARNING,
            threshold_minutes: c.SLA_WARNING_THRESHOLD_MINUTES,
            asset_status_at_alert: asset.latest_status,
            sla_started_at: asset.sla!.started_at!,
            elapsed_minutes: this.elapsedMinutes(asset, now),
            notification_id: group.id,
          });
          if (inserted) kept.push(asset);
        }
        group.assets = kept;
      }

      // 3. Load context once for all assets (files + owner emails), render, insert notifications.
      const contexts = await this.loadContexts([...groups.values()].flatMap((g) => g.assets), now);
      const created: SlaNotificationDocument[] = [];
      for (const group of groups.values()) {
        if (!group.assets.length) continue;
        const items = group.assets.map((a) => contexts.get(a._id.toHexString())!);
        const payload = digest
          ? this.formatter.buildDigest(items, c.SLA_WARNING_THRESHOLD_MINUTES)
          : this.formatter.buildSingle(items[0]!);
        created.push(
          await this.notificationRepository.insertWithId({
            _id: group.id,
            channel: SLA_CHANNEL.SLACK,
            kind: digest ? SLA_NOTIFICATION_KIND.DIGEST : SLA_NOTIFICATION_KIND.SINGLE,
            tier: SLA_TIER.WARNING,
            asset_ids: group.assets.map((a) => a._id),
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
      console.error('SLA check failed after claiming; rolling back', err);
      await this.alertRepository.deleteByNotificationIds(notificationIds).catch(() => undefined);
      await this.notificationRepository.deleteByIds(notificationIds).catch(() => undefined);
      await this.assetRepository.releaseSlaWarning(claimed.map((a) => a._id)).catch(() => undefined);
      throw err;
    }
  }
```

The rollback releases all claimed assets, including ones a duplicate-key error dropped. That's safe: a released asset whose earlier alert still exists hits the unique index again on the next check and is dropped again.

**`loadContexts`** makes 2 queries in total, whatever the batch size:
- `fileRepository.find({ asset_id: { $in: ids } }, { asset_id: 1, type: 1, height: 1, latest_status: 1 })`
- `userService.findEmailsByIds(userIds)` returns a `Map<string, string>` (new method, §5.10)

**`deliver`** takes the lease, sends, and records the result:

```ts
  private async deliver(n: SlaNotificationDocument, now: Date): Promise<DeliveryResult> {
    const c = AppConfigService.appConfig;
    const leased = await this.notificationRepository.lease(
      n._id, n.attempts, new Date(now.getTime() + SLA_DELIVERY_LEASE_MS)
    );
    if (!leased) return 'SKIPPED'; // another check is sending it

    try {
      await this.slackChannel.send(leased.payload);
      await this.notificationRepository.markSent(leased._id, new Date());
      return 'SENT';
    } catch (err: any) {
      const message = String(err?.message ?? err).slice(0, SLA_LAST_ERROR_MAX_LENGTH);
      if (leased.attempts >= c.SLA_MAX_DELIVERY_ATTEMPTS) {
        console.error(`SLA notification ${leased._id} failed permanently`, message);
        await this.notificationRepository.markFailed(leased._id, message);
        return 'FAILED';
      }
      const delay = err instanceof ChannelRateLimitedError ? err.retryAfterMs : slaRetryDelayMs(leased.attempts);
      await this.notificationRepository.markRetry(leased._id, new Date(Date.now() + delay), message);
      return 'PENDING';
    }
  }

  private async retryDueNotifications(now: Date) {
    const due = await this.notificationRepository.findDue(now, SLA_RETRY_BATCH_SIZE);
    const result = { attempted: 0, sent: 0, failed: 0 };
    for (const n of due) {
      const r = await this.deliver(n, now);
      if (r === 'SKIPPED') continue;
      result.attempted++;
      if (r === 'SENT') result.sent++;
      if (r === 'FAILED') result.failed++;
    }
    return result;
  }

  private elapsedMinutes(asset: AssetDocument, now: Date): number {
    return Math.floor((now.getTime() - asset.sla!.started_at!.getTime()) / 60_000);
  }

  async sendTestNotification() { /* insert TEST notification (asset_ids: []), deliver, return its status */ }
}
```

If the API crashes after `lease()` but before `markSent`/`markRetry`, the notification keeps `status: PENDING` with `next_attempt_at` 2 minutes ahead, so a later check picks it up again. In that rare case it may be sent twice, which is acceptable.

### 5.8 Guard

**`guards/internal-api-key.guard.ts`:**

```ts
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = AppConfigService.appConfig.INTERNAL_API_KEY;
    if (!expected) throw new ServiceUnavailableException('INTERNAL_API_KEY is not configured');

    const provided = context.switchToHttp().getRequest<Request>().header('x-internal-api-key') ?? '';
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException('invalid internal api key');
    }
    return true;
  }
}
```

### 5.9 Controller

**`controllers/sla.controller.ts`:**

```ts
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
    // filter by asset_id / createdAt range, limit 100, join notification status via notificationRepository.findByIds
  }
}
```

`@HttpCode(200)` matters: Nest returns 201 for `POST` by default. The response body is the plain summary object, not wrapped in `BaseApiResponse`, which keeps the cron log readable. `CronjobController` returns plain objects too.

**`dto/list-sla-alerts-query.dto.ts`:** `asset_id?` (`@IsMongoId`), `from?`/`to?` (`@IsISO8601`), all `@IsOptional`. The global `ValidationPipe({ transform: true })` already validates them.

### 5.10 Wiring

**`sla.module.ts`:**

```ts
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
```

**Edit `src/api/assets/assets.module.ts`:** add `exports: [AssetRepository, FileRepository]`.

**Edit `src/api/auth/services/user.service.ts`:**

```ts
async findEmailsByIds(ids: Types.ObjectId[]): Promise<Map<string, string>> {
  const users = await this.userRepository.find({ _id: { $in: ids } }, { email: 1 });
  return new Map((users ?? []).map((u) => [u._id.toString(), u.email]));
}
```

**Edit `src/api/api.module.ts`:** add `SlaModule` to `imports`.

The module doesn't import `BullModule` or `RabbitMQModule`, as the design requires.

---

## 6. Script, docs and rollout support (PR 2)

**Create `server/scripts/sla-check.sh`** and make it executable with `chmod +x`:

```bash
#!/bin/bash

# Runs one SLA check. Scheduled by crontab every 5 minutes. See specs/video-sla-alerting.md.

curl --silent --show-error --fail \
  --max-time 120 \
  --request POST \
  --header "x-internal-api-key: ${INTERNAL_API_KEY}" \
  --url http://localhost:3000/api/v1/sla/check
echo
```

The URL is hard-coded, like in `cleanup.sh` and `verify-bullmq-jobs.sh`. Change the port to match the host's `API_PORT`; the existing scripts use `4000`.

**Edit `CLAUDE.md`** (pipeline section): add a short paragraph saying SLA alerting lives in `src/api/sla/`, is triggered by crontab through `POST /api/v1/sla/check`, uses no Redis, and that the clock starts in `AssetService.updateAssetStatus` on `DOWNLOADING`.

---

## 7. File change summary

| File | Change | PR |
|---|---|---|
| `src/common/app-config/environment.ts` | SLA vars | 1 |
| `src/common/app-config/service/app-config.service.ts` | SLA vars with defaults | 1 |
| `server/example.env` | SLA vars | 1 |
| `src/api/assets/schemas/sla.schema.ts` | new | 1 |
| `src/api/assets/schemas/assets.schema.ts` | `sla` prop + partial index | 1 |
| `src/api/sla/sla-clock.ts` | new | 1 |
| `src/api/assets/repositories/asset.repository.ts` | 4 SLA methods | 1 |
| `src/api/assets/services/asset.service.ts` | `updateAssetStatus` clock logic | 1 |
| `src/api/sla/**` | new module (§5.1) | 2 |
| `src/api/assets/assets.module.ts` | export `AssetRepository`, `FileRepository` | 2 |
| `src/api/auth/services/user.service.ts` | `findEmailsByIds` | 2 |
| `src/api/api.module.ts` | import `SlaModule` | 2 |
| `server/scripts/sla-check.sh` | new | 2 |
| `CLAUDE.md` | SLA paragraph | 2 |

No worker, frontend or `video-touch-common` changes.

## 8. Manual test plan

No automated tests are written for this feature; everything is checked by hand. Run each PR's checks locally with the full stack up (`docker compose -f docker-compose-infra.yml up -d` and `docker compose up -d` in `server/`).

**Shortcuts:**
- Set `SLA_WARNING_THRESHOLD_MINUTES=1` so you only wait one minute instead of 30.
- Run a check with `INTERNAL_API_KEY=<key> server/scripts/sla-check.sh`.
- Inspect data in the Mongo shell: `docker exec -it mongodb mongosh video_touch_db`.
- To make an asset look overdue without waiting, move its clock back:
  `db.assets.updateOne({ _id: ObjectId('<id>') }, { $set: { 'sla.started_at': new Date(Date.now() - 31*60*1000) } })`
- To make a pending Slack retry due now:
  `db.sla_notifications.updateOne({ _id: ObjectId('<id>') }, { $set: { next_attempt_at: new Date() } })`

### PR 1

| # | Check | Steps | Expected |
|---|---|---|---|
| 1.1 | Build | `npm run build` and `npm run lint` in `server/api` | Both pass |
| 1.2 | Clock starts | Import a video from a URL | Once it reaches `DOWNLOADING`, `db.assets.findOne({_id: …}).sla.started_at` is set |
| 1.3 | Clock doesn't move | Note `started_at`, let the video finish | `started_at` is unchanged; `READY` writes nothing to `sla` |
| 1.4 | Reprocess resets | Reprocess a `READY` video | `sla` fields are cleared at `RE_PROCESSING`, and a new, later `started_at` is set at `DOWNLOADING` |
| 1.5 | Webhooks still fire | Register a webhook to a request bin (e.g. webhook.site), import a video, then reprocess it | `asset.status.*` events arrive for every status change, including `re_processing` (this confirms the post-hook still sees `$set.latest_status` when the update carries `$unset`) |
| 1.6 | Old assets ignored | Look at an asset created before the deploy | No `sla` field |

### PR 2

| # | Check | Steps | Expected |
|---|---|---|---|
| 2.1 | Build | `npm run build` and `npm run lint` | Both pass |
| 2.2 | Key not configured | Unset `INTERNAL_API_KEY`, call `POST /api/v1/sla/check` | `503` |
| 2.3 | Wrong key | Call with a wrong `x-internal-api-key` | `401` |
| 2.4 | Disabled | `SLA_ALERTS_ENABLED=false`, run the script | Prints `{"skipped":true}`; nothing written to `sla_alerts` / `sla_notifications` |
| 2.5 | Misconfigured | `SLA_ALERTS_ENABLED=true`, no `SLA_SLACK_WEBHOOK_URL` | Startup logs an error; the script exits non-zero and the response is a `500` with a clear message |
| 2.6 | Test message | `POST /api/v1/sla/test-notification` | `[TEST]` message in Slack; a `TEST` row in `sla_notifications` with `status: SENT` |
| 2.7 | Not overdue yet | Import a video, run the check right away | `claimed: 0`, no Slack message |
| 2.8 | Single alert | Stop `process-video-worker-*`, import a video, wait past the threshold, run the check | One Slack message with title, status and file breakdown (playlists `QUEUED`); `sla.warning_alerted_at` set; one `sla_alerts` row; notification `SENT` |
| 2.9 | No duplicate | Run the check again | `claimed: 0`, no new Slack message |
| 2.10 | Overlapping runs | Make 3 assets overdue, then run the script twice at the same time (`./sla-check.sh & ./sla-check.sh & wait`) | Exactly one Slack message per asset; one `sla_alerts` row per asset |
| 2.11 | Excluded assets | Make one asset overdue and `READY`, one soft-deleted, and one with `started_at` 25 h ago | None of them are alerted |
| 2.12 | `FAILED` included | Make a `FAILED` asset overdue (it needs `sla.started_at`) | Alerted, with status `FAILED` in the message |
| 2.13 | Digest | Make 8 assets overdue, run the check | One digest message listing all 8; one `DIGEST` notification with 8 `asset_ids` |
| 2.14 | Reprocessed asset | Reprocess an alerted asset, stop the workers, make it overdue again | A second alert, with a different `sla_started_at` |
| 2.15 | Slack down, then back | Set `SLA_SLACK_WEBHOOK_URL` to an invalid URL, make an asset overdue, run the check; restore the URL, make the notification due, run again | First run: notification `PENDING`, `attempts: 1`, `last_error` set, `next_attempt_at` ≈ 5 min ahead. Second run: `SENT`, `retried.sent: 1` |
| 2.16 | Permanent failure | `SLA_MAX_DELIVERY_ATTEMPTS=2`, invalid URL, run twice (making it due in between) | Notification `FAILED`; an error in the API log |
| 2.17 | Redis down | Import a video, wait for `DOWNLOADING` or later, `docker stop redis`, make it overdue, run the check | Alert still sent. Start Redis again afterwards |
| 2.18 | Alert listing | `GET /api/v1/sla/alerts?asset_id=<id>` | Lists that asset's alerts with the notification status |
| 2.19 | Load | Make 50 assets overdue, run the check | One digest; the check returns in under 10 s |
| 2.20 | Crontab | Install the crontab entry from design §10.2, wait 10 minutes | The log has a summary line every 5 minutes |
