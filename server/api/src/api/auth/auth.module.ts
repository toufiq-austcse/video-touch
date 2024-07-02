import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_COLLECTION_NAME, UserSchema } from '@/src/api/auth/schemas/user.schema';
import { UserRepository } from '@/src/api/auth/repositories/user.repository';
import { AuthResolver } from '@/src/api/auth/resolvers/auth.resolver';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: USER_COLLECTION_NAME,
        useFactory: () => {
          return UserSchema;
        },
      },
    ]),
  ],
  providers: [AuthResolver, UserRepository],
})
export class AuthModule {}
