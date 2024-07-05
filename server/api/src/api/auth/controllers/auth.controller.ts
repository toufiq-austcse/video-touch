import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { SignupReqDto } from '@/src/api/auth/dtos/signup-req.dto';
import { UserService } from '@/src/api/auth/services/user.service';
import { AuthService } from '@/src/api/auth/services/auth.service';
import { AuthResDto, UserResDto } from '@/src/api/auth/dtos/auth-res.dto';
import { AuthMapper } from '@/src/api/auth/mapper/auth.mapper';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { LoginReqDto } from '@/src/api/auth/dtos/login-req.dto';
import { JwtAuthGuard } from '@/src/api/auth/guards/jwt-auth.guard';
import { UserInfoDec } from '@/src/common/decorators/user-info.decorator';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { ResponseInterceptor } from '@/src/common/interceptors/response.interceptor';
import {
  BaseApiResponse,
  SwaggerBaseApiErrorResponse,
  SwaggerBaseApiResponse
} from '@/src/common/dto/base-api-response.dto';
import { UserMapper } from '@/src/api/auth/mapper/user.mapper';
import { LocalAuthGuard } from '@/src/api/auth/guards/local-auth.guard';

@Controller({ version: '1', path: 'auth' })
@ApiTags('Auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private userService: UserService, private authService: AuthService) {
  }

  @Post('signup')
  @ApiCreatedResponse({ type: SwaggerBaseApiResponse(AuthResDto, HttpStatus.CREATED) })
  @ApiBadRequestResponse({ type: SwaggerBaseApiErrorResponse(HttpStatus.BAD_REQUEST) })
  @ApiUnprocessableEntityResponse({ type: SwaggerBaseApiErrorResponse(HttpStatus.UNPROCESSABLE_ENTITY) })
  async signup(@Body() body: SignupReqDto): Promise<AuthResDto> {
    let existingUser = await this.userService.getUserEmail(body.email);
    if (existingUser) {
      throw new UnprocessableEntityException('User already exists with this email');
    }
    let newUser = await this.userService.createUser(body.name, body.email, body.password);
    let token = await this.authService.generateToken(newUser);
    return AuthMapper.toAuthRes(newUser, token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: SwaggerBaseApiResponse(AuthResDto, HttpStatus.OK) })
  @ApiBadRequestResponse({ type: SwaggerBaseApiErrorResponse(HttpStatus.BAD_REQUEST) })
  @ApiUnauthorizedResponse({ type: SwaggerBaseApiErrorResponse(HttpStatus.UNAUTHORIZED) })
  async login(@Body() body: LoginReqDto, @UserInfoDec() user: UserDocument): Promise<BaseApiResponse<AuthResDto>> {
    let token = await this.authService.generateToken(user);
    let data = AuthMapper.toAuthRes(user, token);
    return {
      message: '',
      data
    };
  }

  @ApiSecurity('auth')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: SwaggerBaseApiResponse(UserResDto, HttpStatus.OK) })
  @ApiUnauthorizedResponse({ type: SwaggerBaseApiErrorResponse(HttpStatus.UNAUTHORIZED) })
  async me(@UserInfoDec() userInfo: UserDocument): Promise<BaseApiResponse<UserResDto>> {
    let userResDto = UserMapper.toUserResDto(userInfo);
    return {
      message: '',
      data: userResDto
    };
  }
}
