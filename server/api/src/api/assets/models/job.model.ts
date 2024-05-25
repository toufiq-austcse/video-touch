export interface VideoDownloadJobModel {
  _id: string;
  source_url: string;
}

export interface VideoValidationJobModel {
  _id: string;
}

export interface VideoProcessingJobModel {
  _id: string;
}

export interface VideoUploadJobModel {
  _id: string;
  height: number;
  width: number;
}

export interface JobMetadataModel {
  height: number;
  width: number;
  processRoutingKey: string;
  processQueue: string;
  uploadRoutingKey: string;
  uploadQueue: string;
}

export interface UpdateAssetStatusEventModel {
  asset_id: string;
  status: string;
  details: string;
}
