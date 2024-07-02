import { Resolver } from '@nestjs/graphql';
import { User } from '@/src/api/auth/models/user.model';

@Resolver(() => User)
export class AuthResolver {
  constructor() {}
}
