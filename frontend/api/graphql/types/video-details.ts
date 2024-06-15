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
}

export interface StatusLog {
  status: string;
  details: string;
  created_at: Date;
}