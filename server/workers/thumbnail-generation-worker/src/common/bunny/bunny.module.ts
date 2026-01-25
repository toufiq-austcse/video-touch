import { Global, Module } from '@nestjs/common';
import { BunnyHttpService } from '@/src/common/bunny/service/bunny-http.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [BunnyHttpService],
  exports: [BunnyHttpService],
})
export class BunnyModule {}
