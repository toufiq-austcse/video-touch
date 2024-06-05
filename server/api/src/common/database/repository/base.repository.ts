import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from '@/src/common/database/schemas/abstract.schema';

export abstract class BaseRepository<T extends AbstractDocument> {
  constructor(protected readonly entityModel: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    const createdDocument = new this.entityModel({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as T;
  }

  async find(entityFilterQuery: FilterQuery<T>, projection?: Partial<T | any>): Promise<T[] | null> {
    if (!projection) {
      return this.entityModel.find(entityFilterQuery, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
    }
    return this.entityModel.find(entityFilterQuery, projection).lean();
  }

  async findOne(entityFilterQuery: FilterQuery<T>): Promise<T | null> {
    return this.entityModel.findOne(entityFilterQuery).lean();
  }

  async findLastOne(entityFilterQuery: FilterQuery<T>): Promise<T | null> {
    return this.entityModel.findOne(entityFilterQuery).sort({ createdAt: -1 });
  }

  async findAll(projection?: Partial<T | any>): Promise<T[] | null> {
    if (!projection) return this.entityModel.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).lean();
    return this.entityModel.find().lean();
  }

  async findOneAndUpdate(entityFilterQuery: FilterQuery<T>, updateEntityData: UpdateQuery<T>): Promise<T | null> {
    return this.entityModel.findOneAndUpdate(entityFilterQuery, updateEntityData);
  }

  async deleteOne(entityFilterQuery: FilterQuery<T>): Promise<any> {
    return this.entityModel.deleteOne(entityFilterQuery);
  }

  async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<any> {
    return this.entityModel.deleteMany(entityFilterQuery);
  }

  async count(entityFilterQuery: FilterQuery<T>): Promise<number> {
    return this.entityModel.countDocuments(entityFilterQuery);
  }
}
