/**
 * Converts minutes to milliseconds
 * @param minutes - The number of minutes to convert
 * @returns The equivalent value in milliseconds
 */
export const minutesToMilliseconds = (minutes: number): number => {
  return minutes * 60 * 1000;
};