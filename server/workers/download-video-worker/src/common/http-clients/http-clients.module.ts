import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DownloaderHttpService } from './downloader/downloader-http.service';


@Global()
@Module({
  imports: [HttpModule],
  providers: [DownloaderHttpService],
  exports: [DownloaderHttpService]
})
export class HttpClientsModule {
}
