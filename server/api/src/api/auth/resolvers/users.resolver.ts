import { Query, Resolver } from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/src/api/auth/guards/gql-auth.guard';
import { UserInfoDec } from '@/src/common/decorators/user-info.decorator';
import { UserDocument } from '@/src/api/auth/schemas/user.schema';
import { UserMapper } from '@/src/api/auth/mapper/user.mapper';
import { User } from '@/src/api/auth/models/user.model';

@Resolver(() => User)
export class UsersResolver {
  @Query(() => User, { name: 'user', nullable: true })
  @UseGuards(GqlAuthGuard)
  getUser(@UserInfoDec() userInfo: UserDocument) {
    return UserMapper.toUserResDto(userInfo);
  }
}
