export interface UpdateAssetStatusEventModel {
  asset_id: string;
  status: string;
  details: string;
}

export interface UpdateAssetEventModel {
  asset_id: string;
  data: any;
}

export interface UpdateFileStatusEventModel {
  asset_id: string;
  height: number;
  status: string;
  details: string;
  dir_size: number;
}
