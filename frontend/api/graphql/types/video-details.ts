export interface VideoDetails {
  _id: string;
  title: string;
  height: number;
  width: number;
  duration: number;
  description: null;
  status_logs: StatusLog[];
  size: number;
  source_url: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  thumbnail_url: string;
  latest_status: string;
}

export interface StatusLog {
  status: string;
  details: null;
  created_at: Date;
}