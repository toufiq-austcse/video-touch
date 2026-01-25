import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Injectable()
export class BunnyHttpService {
  constructor(private readonly httpService: HttpService) {}

  public async uploadFile(options: { filePath: string; remotePath: string; contentType: string }): Promise<any> {
    const fileBuffer = fs.readFileSync(options.filePath);
    const uploadUrl = `${AppConfigService.appConfig.BUNNY_STORAGE_URL}/${AppConfigService.appConfig.BUNNY_STORAGE_ZONE_NAME}/${options.remotePath}`;

    const response = await firstValueFrom(
      this.httpService.put(uploadUrl, fileBuffer, {
        headers: {
          AccessKey: AppConfigService.appConfig.BUNNY_ACCESS_KEY,
          'Content-Type': options.contentType,
        },
      }),
    );

    return response.data;
  }
}
