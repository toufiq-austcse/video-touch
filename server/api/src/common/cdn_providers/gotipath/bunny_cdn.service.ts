import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BunnyCdnService {
  constructor(private httpService: HttpService) {}

  async clearCache(cacheTag: string): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.httpService.post(
          `${AppConfigService.appConfig.BUNNY_CDN_API_BASE_URL}/pullzone/${AppConfigService.appConfig.BUNNY_CDN_PULL_ZONE_ID}/purgeCache`,
          {
            CacheTag: cacheTag,
          },
          {
            headers: {
              AccessKey: `Bearer ${AppConfigService.appConfig.BUNNY_CDN_API_KEY}`,
            },
          }
        )
      );
      return res.data;
    } catch (e) {
      console.log('Error clearing cache on BunnyCDN:', e);
      throw e;
    }
  }
}
