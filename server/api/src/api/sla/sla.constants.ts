export const SLA_TIER = { WARNING: 'WARNING' } as const;
export type SlaTier = (typeof SLA_TIER)[keyof typeof SLA_TIER];

export const SLA_CHANNEL = { SLACK: 'SLACK' } as const;
export type SlaChannelName = (typeof SLA_CHANNEL)[keyof typeof SLA_CHANNEL];

export const SLA_NOTIFICATION_KIND = { SINGLE: 'SINGLE', DIGEST: 'DIGEST', TEST: 'TEST' } as const;
export type SlaNotificationKind = (typeof SLA_NOTIFICATION_KIND)[keyof typeof SLA_NOTIFICATION_KIND];

export const SLA_NOTIFICATION_STATUS = { PENDING: 'PENDING', SENT: 'SENT', FAILED: 'FAILED' } as const;
export type SlaNotificationStatus = (typeof SLA_NOTIFICATION_STATUS)[keyof typeof SLA_NOTIFICATION_STATUS];

export const SLA_ALERT_COLLECTION_NAME = 'sla_alerts';
export const SLA_NOTIFICATION_COLLECTION_NAME = 'sla_notifications';

export const SLA_RETRY_BATCH_SIZE = 20;
export const SLA_DELIVERY_LEASE_MS = 2 * 60 * 1000;
export const SLA_DIGEST_MAX_ROWS = 20;
export const SLA_LAST_ERROR_MAX_LENGTH = 1024;
export const SLA_ALERTS_LIST_LIMIT = 100;

/** Backoff after the Nth failed attempt (1-based): 5, 10, 20, 40 minutes. */
export function slaRetryDelayMs(failedAttempts: number): number {
  return 5 * 60 * 1000 * 2 ** Math.max(0, failedAttempts - 1);
}
