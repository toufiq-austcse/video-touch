import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GotipathCdnService } from '@/src/common/cdn_providers/gotipath/gotipath_cdn.service';
import { BunnyCdnService } from '@/src/common/cdn_providers/gotipath/bunny_cdn.service';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [GotipathCdnService, BunnyCdnService],
  exports: [GotipathCdnService, BunnyCdnService],
})
export class CdnProvidersModule {}
