import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { plainToInstance } from 'class-transformer';
import { User } from '@/src/api/auth/models/user.model';

export class UserMapper {
  static buildUserDocumentForSaving(name: string, email: string, password: string): Omit<UserDocument, '_id'> {
    return {
      name,
      email,
      password,
    };
  }

  static toUserResDto(userDocument: UserDocument): User {
    return plainToInstance(
      User,
      {
        _id: userDocument._id.toString(),
        name: userDocument.name,
        email: userDocument.email,
        createdAt: userDocument.createdAt.toISOString(),
        updatedAt: userDocument.updatedAt.toISOString(),
      } as User,
      {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }
    );
  }
}
