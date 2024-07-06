import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: any) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
