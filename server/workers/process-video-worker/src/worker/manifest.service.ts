import { Injectable } from '@nestjs/common';
import { Utils, Constants } from '@toufiq-austcse/video-touch-common';
import fs from 'fs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';


@Injectable()
export class ManifestService {
  constructor() {
  }

  appendManifest(assetId: string, height: number) {
    let manifestFilePath = Utils.getMainManifestPath(assetId, AppConfigService.appConfig.TEMP_VIDEO_DIRECTORY);
    this.createManifestFile(manifestFilePath);
    fs.writeFileSync(manifestFilePath, `\n${this.getRules(height)}`, { flag: 'a' });
    console.log('manifest file updated for asset:', assetId, 'height:', height);
  }

  private getRules(height: number): string {
    if (height === 360) {
      return this.get360pRule();
    }
    if (height === 480) {
      return this.get480pRule();
    }
    if (height === 540) {
      return this.get540pRule();
    }
    if (height === 720) {
      return this.get720pRule();
    }
    if (height === 1080) {
      return this.get1080pRule();
    }
    return '';
  }

  private get360pRule(): string {
    let { height, width } = Constants.VIDEO_RESOLUTION['360p'];
    return `#EXT-X-STREAM-INF:BANDWIDTH=375000,RESOLUTION=${width}x${height}\n${height}/${height}_out.m3u8`;
  }

  private get480pRule(): string {
    let { height, width } = Constants.VIDEO_RESOLUTION['480p'];
    return `#EXT-X-STREAM-INF:BANDWIDTH=750000,RESOLUTION=${width}x${height}\n${height}/${height}_out.m3u8`;
  }

  private get540pRule(): string {
    let { height, width } = Constants.VIDEO_RESOLUTION['540p'];
    return `#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=${width}x${height}\n${height}/${height}_out.m3u8`;
  }

  private get720pRule(): string {
    let { height, width } = Constants.VIDEO_RESOLUTION['720p'];
    return `#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=${width}x${height}\n${height}/${height}_out.m3u8`;
  }

  private get1080pRule(): string {
    let { height, width } = Constants.VIDEO_RESOLUTION['1080p'];
    return `#EXT-X-STREAM-INF:BANDWIDTH=3500000,RESOLUTION=${width}x${height}\n${height}/${height}_out.m3u8`;
  }

  private createManifestFile(path: string) {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, '#EXTM3U');
    }
  }
}
