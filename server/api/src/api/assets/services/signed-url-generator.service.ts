import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Injectable()
export class SignedUrlGeneratorService {
  generateSecureUrl(path: string, ttlInSec: number): { token: string; expires: number } {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!path.endsWith('/')) {
      path += '/';
    }
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Clean path from any query parameters
    const cleanPath = normalizedPath.split('?')[0];

    // Get directory path (keep trailing slash)
    const dirPath = cleanPath.substring(0, cleanPath.lastIndexOf('/') + 1);

    const expires = Math.floor(Date.now() / 1000) + ttlInSec;

    // Token generation
    const tokenString = `${expires}${dirPath} ${AppConfigService.appConfig.GOTIPATH_CDN_SECRET}`;
    console.log('Token String:', tokenString);
    const tokenHash = crypto.createHash('md5').update(tokenString).digest();
    const token = Buffer.from(tokenHash)
      .toString('base64')
      .replace(/\n/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Return just the token and expires
    return { token, expires };
  }
}
