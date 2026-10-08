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
