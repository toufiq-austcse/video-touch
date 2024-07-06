import { Injectable } from '@nestjs/common';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Token } from '@/src/api/auth/dtos/auth-res.dto';
import * as bcrypt from 'bcryptjs';

export interface TokenPayload {
  user_id: string;
}

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(user: UserDocument): Promise<Token> {
    const tokenPayload: TokenPayload = {
      user_id: user._id.toString(),
    };

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + AppConfigService.appConfig.JWT_EXPIRATION_TIME_IN_SEC);
    let accessToken = await this.jwtService.signAsync(tokenPayload);
    return {
      access_token: accessToken,
      expires_at: expires.getTime(),
    };
  }

  async getHashedPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(givenPassword: string, actualPassword: string) {
    return bcrypt.compare(givenPassword, actualPassword);
  }
}
