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
