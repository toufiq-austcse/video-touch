import { Injectable } from '@nestjs/common';
import { UserRepository } from '@/src/api/auth/repositories/user.repository';
import { UserMapper } from '@/src/api/auth/mapper/user.mapper';

@Injectable()
export class UserService {
  constructor(private repository: UserRepository) {
  }

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

}
