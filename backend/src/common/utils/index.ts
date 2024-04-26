import * as fs from 'fs';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import * as path from 'path';
import { readdir, stat } from 'fs/promises';

export function concatObject(obj: Object, separator: string = ', ') {
  return Object.keys(obj)
    .map(function(key, index) {
      return (obj as any)[key];
    })
    .join(separator);
}

export function getLocalVideoMp4Path(videoId: string) {
  let path = getLocalVideoRootPath(videoId);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  return `${path}/${videoId}.mp4`;
}

export function getLocalVideoRootPath(videoId: string) {
  return `temp_videos/${videoId}`;
}

export function getLocalResolutionPath(videoId: string, height: number) {
  let path = `${getLocalVideoRootPath(videoId)}/${height}`;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  return path;
}

export function getRefPlayListPath(videoId: string, height: number) {
  return `${videoId}/${height}/${height}_out.m3u8`;
}

export function getFileName(height: number) {
  return `${height}_out.m3u8`;
}

export function getS3VideoPath(videoId: string, height: number) {
  return `s3://${AppConfigService.appConfig.AWS_S3_BUCKET_NAME}/videos/${videoId}/${height}`;
}

export function getS3ManifestPath(videoId: string) {
  return `videos/${videoId}/${getMainManifestFileName()}`;
}

export async function getDirSize(directory: string) {
  const files = await readdir(directory);
  const stats = files.map((file) => stat(path.join(directory, file)));

  return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}

export function getMainManifestPath(assetId: string) {
  return `${getLocalVideoRootPath(assetId)}/${getMainManifestFileName()}`;
}

export function getMasterPlaylistUrl(assetId: string) {
  return `${AppConfigService.appConfig.VIDEO_BASE_URL}/${assetId}/${getMainManifestFileName()}`;
}

export function getMainManifestFileName() {
  return 'main.m3u8';
}
