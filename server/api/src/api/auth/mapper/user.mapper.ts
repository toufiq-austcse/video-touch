import { UserDocument } from '@/src/api/auth/schemas/user.schema';

export class UserMapper {
  static buildUserDocumentForSaving(name: string, email: string, password: string): Omit<UserDocument, '_id'> {
    return {
      name,
      email,
      password,
    };
  }
}
