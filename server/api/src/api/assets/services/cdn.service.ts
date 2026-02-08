import { Injectable } from '@nestjs/common';
import { BunnyCdnService } from '@/src/common/cdn_providers/gotipath/bunny_cdn.service';
import { GotipathCdnService } from '@/src/common/cdn_providers/gotipath/gotipath_cdn.service';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { CDN_PROVIDERS } from '@/src/common/constants';
import { getServerManifestPath } from 'video-touch-common/dist/utils';

@Injectable()
export class CdnService {
  constructor(private bunnyCdnService: BunnyCdnService, private gotipathCdnService: GotipathCdnService) {}

  async invalidateCache(file: FileDocument) {
    const masterFilePath = getServerManifestPath(file.asset_id.toString());

    if (AppConfigService.appConfig.CDN_PROVIDER === CDN_PROVIDERS.GOTIPATH) {
      this.gotipathCdnService
        .clearCache([masterFilePath])
        .then(() => {
          console.log(`Cache invalidated for ${masterFilePath} on Gotipath CDN`);
        })
        .catch((err) => {
          console.error(`Error invalidating cache for ${masterFilePath} on Gotipath CDN:`, err);
        });
    }

    if (AppConfigService.appConfig.CDN_PROVIDER === CDN_PROVIDERS.BUNNY_CDN) {
      this.bunnyCdnService
        .clearCache(file.asset_id.toString())
        .then(() => {
          console.log(`Cache invalidated for asset ${file.asset_id} on BunnyCDN`);
        })
        .catch((err) => {
          console.error(`Error invalidating cache for asset ${file.asset_id} on BunnyCDN:`, err);
        });
    }
  }

  static getCdnBaseUrl(): string {
    if (AppConfigService.appConfig.CDN_PROVIDER === CDN_PROVIDERS.GOTIPATH) {
      return AppConfigService.appConfig.GOTIPATH_CDN_BASE_URL;
    }

    if (AppConfigService.appConfig.CDN_PROVIDER === CDN_PROVIDERS.BUNNY_CDN) {
      return AppConfigService.appConfig.BUNNY_CDN_BASE_URL;
    }

    return '';
  }
}
