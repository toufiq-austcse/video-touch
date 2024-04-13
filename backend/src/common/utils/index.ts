import * as fs from 'fs';

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
    fs.mkdirSync(path);
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

