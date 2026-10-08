import { Types } from 'mongoose';
import { AssetDocument } from '@/src/api/assets/schemas/assets.schema';

/** The assets that go into one Slack message: one asset, or many for a digest. */
export interface NotificationGroup {
  id: Types.ObjectId;
  assets: AssetDocument[];
}
