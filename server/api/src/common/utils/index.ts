import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { Constants, Utils } from 'video-touch-common';
import { FileDocument } from '@/src/api/assets/schemas/files.schema';

/**
 * Converts minutes to milliseconds
 * @param minutes - The number of minutes to convert
 * @returns The equivalent value in milliseconds
 */
export const minutesToMilliseconds = (minutes: number): number => {
  return minutes * 60 * 1000;
};

export const getSourceFileName = (): string => {
  return 'source.mp4';
};

export const getDownloadFileName = (): string => {
  return 'download.mp4';
};
export const getCdnFileUrl = (file: FileDocument): string => {
  let cdnBaseUrl = AppConfigService.appConfig.CDN_BASE_URL;
  switch (file.type) {
    case Constants.FILE_TYPE.SOURCE:
      return `${cdnBaseUrl}/${Utils.getServerSourceFileVideoPath(file.asset_id.toString(), file.name)}`;
    case Constants.FILE_TYPE.THUMBNAIL:
      return `${cdnBaseUrl}/${Utils.getServerThumbnailPath(file.asset_id.toString())}`;
    case Constants.FILE_TYPE.AUDIO:
      return `${cdnBaseUrl}/${Utils.getServerAudioFilePath(file.asset_id.toString(), file.name)}`;
    case Constants.FILE_TYPE.DOWNLOAD:
      return `${cdnBaseUrl}/${Utils.getServerDownloadFilePath(file.asset_id.toString(), file.name)}`;
    case Constants.FILE_TYPE.TRANSCRIPT:
      return `${cdnBaseUrl}/${Utils.getServerTranscriptFilePath(file.asset_id.toString(), file.name)}`;
    default:
      return ``;
  }
};
