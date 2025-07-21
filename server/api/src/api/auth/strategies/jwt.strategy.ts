import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '@/src/api/auth/services/user.service';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { TokenPayload } from '@/src/api/auth/services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AppConfigService.appConfig.JWT_SECRET,
    });
  }

  async validate({ user_id }: TokenPayload) {
    let user = await this.userService.getUserById(user_id);
    if (!user) {
      return null;
    }
    delete user.password;
    return user;
  }
}
