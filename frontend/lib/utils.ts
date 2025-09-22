import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bytesToMegaBytes(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

export function secondsToHHMMSS(seconds: number) {
  return new Date(seconds * 1000).toISOString().substr(11, 8);
}

export function getPollInterval(pollingIntervalInSec: number) {
  return pollingIntervalInSec * 1000 || 10000;
}
