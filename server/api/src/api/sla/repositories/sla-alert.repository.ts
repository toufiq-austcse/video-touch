import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, Types } from 'mongoose';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { SLA_ALERT_COLLECTION_NAME } from '@/src/api/sla/sla.constants';
import { SlaAlertDocument } from '@/src/api/sla/schemas/sla-alert.schema';

@Injectable()
export class SlaAlertRepository extends BaseRepository<SlaAlertDocument> {
  constructor(@InjectModel(SLA_ALERT_COLLECTION_NAME) private model: Model<SlaAlertDocument>) {
    super(model);
  }

  /** Inserts one alert. Returns false on duplicate key (already alerted); rethrows anything else. */
  async insertIfAbsent(doc: Omit<SlaAlertDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      await this.model.create({ ...doc, _id: mongoose.Types.ObjectId() });
      return true;
    } catch (err: any) {
      if (err?.code === 11000) {
        return false;
      }
      throw err;
    }
  }

  async deleteByNotificationIds(ids: Types.ObjectId[]) {
    return this.model.deleteMany({ notification_id: { $in: ids } });
  }

  async list(filter: FilterQuery<SlaAlertDocument>, limit: number): Promise<SlaAlertDocument[]> {
    return this.model.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  }
}
