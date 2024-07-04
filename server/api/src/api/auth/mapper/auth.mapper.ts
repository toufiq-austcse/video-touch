import { SignupResDto, TokenDetails } from '@/src/api/auth/dtos/signup-res.dto';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { plainToInstance } from 'class-transformer';

export class AuthMapper {
  static toSignUpRes(user: UserDocument, tokenDetails: TokenDetails): SignupResDto {
    return plainToInstance(
      SignupResDto,
      {
        name: user.name,
        email: user.email,
        token_details: tokenDetails,
      } as SignupResDto,
      {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }
    );
  }
}
