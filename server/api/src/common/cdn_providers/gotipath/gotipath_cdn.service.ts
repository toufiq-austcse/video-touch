import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GotipathCdnService {
  constructor(private httpService: HttpService) {}

  async clearCache(paths: string[]): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.httpService.post(
          `${AppConfigService.appConfig.GOTIPATH_API_BASE_URL}/distributions/${AppConfigService.appConfig.GOTIPATH_CDN_DISTRIBUTION_ID}/purges`,
          {
            type: 'paths',
            paths: paths,
          },
          {
            headers: {
              Authorization: `Bearer ${AppConfigService.appConfig.GOTIPATH_API_KEY}`,
            },
          }
        )
      );
      return res.data;
    } catch (e) {
      console.error('Error clearing cache on Gotipath CDN:', e);
      throw e;
    }
  }
}
