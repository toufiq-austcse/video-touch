import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/src/api/auth/repositories/user.repository';
import { UserMapper } from '@/src/api/auth/mapper/user.mapper';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {}

  async getUserEmail(email: string) {
    return this.repository.findOne({ email });
  }

  async createUser(name: string, email: string, password: string) {
    let userForSaving = UserMapper.buildUserDocumentForSaving(name, email, password);
    return this.repository.create(userForSaving);
  }

  getUserById(userId: string) {
    return this.repository.findOne({ _id: userId });
  }

  async findEmailsByIds(ids: Types.ObjectId[]): Promise<Map<string, string>> {
    const users = await this.repository.find({ _id: { $in: ids } }, { email: 1 });
    return new Map((users ?? []).map((user) => [user._id.toString(), user.email]));
  }
}
