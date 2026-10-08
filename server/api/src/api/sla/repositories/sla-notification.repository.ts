import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '@/src/common/database/repository/base.repository';
import { SLA_NOTIFICATION_COLLECTION_NAME, SLA_NOTIFICATION_STATUS } from '@/src/api/sla/sla.constants';
import { SlaNotificationDocument } from '@/src/api/sla/schemas/sla-notification.schema';

@Injectable()
export class SlaNotificationRepository extends BaseRepository<SlaNotificationDocument> {
  constructor(@InjectModel(SLA_NOTIFICATION_COLLECTION_NAME) private model: Model<SlaNotificationDocument>) {
    super(model);
  }

  /** Unlike BaseRepository.create(), keeps the caller's _id. */
  async insertWithId(doc: SlaNotificationDocument): Promise<SlaNotificationDocument> {
    return (await this.model.create(doc)).toJSON() as SlaNotificationDocument;
  }

  async findDue(now: Date, limit: number): Promise<SlaNotificationDocument[]> {
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
  async lease(id: Types.ObjectId, expectedAttempts: number, leaseUntil: Date): Promise<SlaNotificationDocument | null> {
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

  async findByIds(ids: Types.ObjectId[]): Promise<SlaNotificationDocument[]> {
    return this.model.find({ _id: { $in: ids } }, { payload: 0 }).lean();
  }
}
