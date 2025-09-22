export interface VODPlaybackRes {
  signed_cookies: SignedCookies;
  expire_in_sec: number;
  media_sources: MediaSource[];
  provider: string;
  player_url: null;
}

export interface MediaSource {
  filesize: number;
  height: number;
  width: number;
  bitrate: number;
  framerate: number;
  file: string;
  type: string;
  label: string;
}

export interface SignedCookies {
  cloudfront_policy: string;
  cloudfront_signature: string;
  cloudfront_key_pair_id: string;
}
