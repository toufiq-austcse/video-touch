import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { terminal, Utils } from 'video-touch-common';
import console from 'node:console';

@Injectable()
export class BunnyHttpService {
  constructor(private readonly httpService: HttpService) {}

  async syncMainManifestFile(assetId: string): Promise<any> {
    let mainManifestPath = Utils.getMainManifestPath(assetId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
    const bunnyManifestPath = this.getBunnyManifestPath(assetId);

    const res = await this.uploadFile({
      filePath: mainManifestPath,
      remotePath: bunnyManifestPath,
      contentType: 'application/vnd.apple.mpegurl',
    });

    console.log('manifest uploaded to Bunny:', res);
    return res;
  }

  private async uploadFile(options: { filePath: string; remotePath: string; contentType: string }): Promise<any> {
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

  /**
   * Syncs a single file to Bunny Storage
   * @param localFile - Absolute path to local file
   * @param bunnyFilePath - Remote path including filename (e.g., "videos/video.mp4")
   */
  async syncFileToBunny(localFile: string, bunnyFilePath: string) {
    console.log(`[Bunny] Uploading file: ${localFile} -> ${bunnyFilePath}`);

    const remote = `:sftp,host='${this.getEndpoint()}',user='${AppConfigService.appConfig.BUNNY_STORAGE_ZONE_NAME}',use_agent=false,pubkey_auth=false:${bunnyFilePath}`;

    // --inplace: Critical to avoid Rename errors
    // $(rclone obscure ...): Encrypts the key for the SFTP handshake
    const command = `rclone copyto "${localFile}" "${remote}" --sftp-pass "$(rclone obscure ${AppConfigService.appConfig.BUNNY_ACCESS_KEY})" --inplace`;

    return terminal(command);
  }

  /**
   * Syncs a directory to Bunny Storage
   * @param localDir - Absolute path to local folder
   * @param bunnyDir - Remote folder path (e.g., "videos/folder_id")
   */
  async syncDirToBunny(localDir: string, bunnyDir: string) {
    console.log(`[Bunny] Syncing directory: ${localDir} -> ${bunnyDir}`);

    const remote = `:sftp,host='${this.getEndpoint()}',user='${AppConfigService.appConfig.BUNNY_STORAGE_ZONE_NAME}',use_agent=false,pubkey_auth=false:${bunnyDir}`;

    // Optimization Flags for Video Segments:
    // --transfers 16: Upload many .ts files at once
    // --sftp-concurrency 16: Parallelize the SFTP pipe
    // --inplace: Skip the .partial file step
    // --delete-after: Only delete old files if the new sync succeeds
    const command = `rclone sync "${localDir}" "${remote}" \
      --sftp-pass "$(rclone obscure ${AppConfigService.appConfig.BUNNY_ACCESS_KEY})" \
      --inplace \
      --transfers 16 \
      --sftp-concurrency 16 \
      --delete-after \
      --fast-list`;

    return terminal(command);
  }

  private getEndpoint(): string {
    return AppConfigService.appConfig.BUNNY_STORAGE_URL.replace('https://', '').replace('http://', '');
  }
  private getBunnyManifestPath(assetId: string): string {
    return `videos/${assetId}/main.m3u8`;
  }
}
