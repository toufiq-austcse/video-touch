import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, UserSchema } from '@/src/api/auth/schemas/user.schema';
import { UserRepository } from '@/src/api/auth/repositories/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AuthController } from '@/src/api/auth/controllers/auth.controller';
import { AuthService } from '@/src/api/auth/services/auth.service';
import { UserService } from '@/src/api/auth/services/user.service';
import { ModuleRef } from '@nestjs/core';
import { JwtStrategy } from '@/src/api/auth/strategies/jwt.strategy';
import { LocalStrategy } from '@/src/api/auth/strategies/local.strategy';
import { UsersResolver } from '@/src/api/auth/resolvers/users.resolver';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: () => ({
        secret: AppConfigService.appConfig.JWT_SECRET,
        signOptions: { expiresIn: AppConfigService.appConfig.JWT_EXPIRATION_TIME_IN_SEC },
      }),
    }),
    MongooseModule.forFeatureAsync([
      {
        name: USER_COLLECTION_NAME,
        inject: [ModuleRef],
        useFactory: (moduleRef: ModuleRef) => {
          let schema = UserSchema;
          schema.pre('save', async function () {
            let authService = moduleRef.get<AuthService>(AuthService, { strict: false });

            console.log('user pre save hook');
            const user: any = this;
            user.password = await authService.getHashedPassword(user.password);
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [UserRepository, AuthService, UserService, JwtStrategy, LocalStrategy, UsersResolver],
  controllers: [AuthController],
  exports: [UserService],
})
export class AuthModule {}
