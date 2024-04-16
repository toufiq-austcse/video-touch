import { StatusDocument } from '@/src/api/videos/schemas/status.schema';

export class StatusMapper {
  static mapForSave(status: string, details: string): Omit<StatusDocument, '_id'> {
    return {
      details: details, status: status,
      createdAt: new Date(),
      updatedAt: new Date()

    };
  }
}