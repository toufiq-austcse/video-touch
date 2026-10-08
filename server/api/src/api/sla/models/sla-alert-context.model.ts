import { Types } from 'mongoose';

/** Everything the formatter needs to render one asset in a Slack message. */
export interface SlaAlertContext {
  asset: {
    _id: Types.ObjectId;
    title: string;
    latest_status: string;
    sla_started_at: Date;
  };
  elapsedMinutes: number;
  ownerEmail?: string;
  files: { type: string; height: number; latest_status: string }[];
}
