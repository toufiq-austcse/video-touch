import { Body, Controller, Post } from '@nestjs/common';
import { SignupReqDto } from '@/src/api/auth/dtos/signup-req.dto';
import { UserService } from '@/src/api/auth/services/user.service';
import { AuthService } from '@/src/api/auth/services/auth.service';
import { SignupResDto } from '@/src/api/auth/dtos/signup-res.dto';
import { AuthMapper } from '@/src/api/auth/mapper/auth.mapper';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private userService: UserService, private authService: AuthService) {
  }

  @Post('signup')
  @ApiCreatedResponse({ description: 'User signed up successfully', type: SignupResDto })
  async signup(@Body() body: SignupReqDto): Promise<SignupResDto> {
    let newUser = await this.userService.createUser(body.name, body.email, body.password);
    let tokenDetails = await this.authService.generateToken(newUser);
    return AuthMapper.toSignUpRes(newUser, tokenDetails);
  }

}