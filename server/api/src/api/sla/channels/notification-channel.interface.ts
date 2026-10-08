import { SlaChannelName } from '@/src/api/sla/sla.constants';

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
