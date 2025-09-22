export interface VideoDetails {
  _id: string;
  title: string;
  height: number;
  width: number;
  duration: number;
  description: string;
  status_logs: StatusLog[];
  size: number;
  source_url: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  thumbnail_url: string;
  latest_status: string;
  master_playlist_url: string;
  files: FileDetails[];
}

export interface FileDetails {
  _id: string;
  name: string;
  size: number;
  latest_status: string;
  height: number;
  width: number;
  type: string;
}

export interface StatusLog {
  status: string;
  details: string;
  created_at: Date;
}

export interface PlaylistSignedUrlResponse {
  main_playlist_url: string;
  resolutions_token: Record<string, string>;
  __typename?: string;
}
