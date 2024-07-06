import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserInfoDec = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  if (ctx.getType() === 'http') {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }

  const gqlContext = GqlExecutionContext.create(ctx);
  return gqlContext.getContext().req.user;
});
