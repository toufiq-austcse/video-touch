import { AuthGuard } from '@nestjs/passport';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    let req = context.switchToHttp().getRequest<Request>();
    let { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }
}
