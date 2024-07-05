import { AuthResDto, Token } from '@/src/api/auth/dtos/auth-res.dto';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { plainToInstance } from 'class-transformer';

export class AuthMapper {
  static toAuthRes(user: UserDocument, token: Token): AuthResDto {
    return plainToInstance(
      AuthResDto,
      {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        token: token,
      } as AuthResDto,
      {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }
    );
  }
}
