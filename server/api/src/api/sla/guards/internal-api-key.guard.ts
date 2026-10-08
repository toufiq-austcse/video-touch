import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import crypto from 'crypto';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

/** Protects internal endpoints (called by crontab) with a shared secret in the x-internal-api-key header. */
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = AppConfigService.appConfig.INTERNAL_API_KEY;
    if (!expected) {
      throw new ServiceUnavailableException('INTERNAL_API_KEY is not configured');
    }

    const provided = context.switchToHttp().getRequest<Request>().header('x-internal-api-key') ?? '';
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new UnauthorizedException('invalid internal api key');
    }
    return true;
  }
}
