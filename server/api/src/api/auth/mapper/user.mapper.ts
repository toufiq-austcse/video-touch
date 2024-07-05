import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { UserResDto } from '@/src/api/auth/dtos/auth-res.dto';
import { plainToInstance } from 'class-transformer';

export class UserMapper {
  static buildUserDocumentForSaving(name: string, email: string, password: string): Omit<UserDocument, '_id'> {
    return {
      name,
      email,
      password,
    };
  }

  static toUserResDto(userDocument: UserDocument): UserResDto {
    return plainToInstance(
      UserResDto,
      {
        _id: userDocument._id.toString(),
        name: userDocument.name,
        email: userDocument.email,
        createdAt: userDocument.createdAt.toISOString(),
        updatedAt: userDocument.updatedAt.toISOString(),
      } as UserResDto,
      {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      }
    );
  }
}
