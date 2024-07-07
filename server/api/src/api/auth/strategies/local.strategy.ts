import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/src/api/auth/services/user.service';
import { AuthService } from '@/src/api/auth/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService, private authService: AuthService) {
    super({
      usernameField: 'email'
    });
  }

  async validate(username: string, password: string) {
    let user = await this.userService.getUserEmail(username);
    if (!user) {
      return null;
    }
    let isPasswordValid = await this.authService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }
}
