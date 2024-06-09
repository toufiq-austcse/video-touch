/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type Asset = {
  __typename?: 'Asset';
  _id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duration: Scalars['Float']['output'];
  height: Scalars['Float']['output'];
  latest_status: Scalars['String']['output'];
  master_playlist_url?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  status_logs: Array<StatusLogResponse>;
  tags: Array<Scalars['String']['output']>;
  thumbnail_url?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  width: Scalars['Float']['output'];
};

export type AssetMinimalResponse = {
  __typename?: 'AssetMinimalResponse';
  _id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  duration: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  thumbnail_url?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type CreateAssetFromUploadInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  file_name: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAssetInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  source_url: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAssetResponse = {
  __typename?: 'CreateAssetResponse';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  source_url: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type GetAssetInputDto = {
  _id: Scalars['String']['input'];
};

export type ListAssetInputDto = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  CreateAsset: CreateAssetResponse;
  CreateAssetFromUpload: CreateAssetResponse;
  DeleteAsset: Scalars['String']['output'];
  UpdateAsset: Asset;
};


export type MutationCreateAssetArgs = {
  createAssetInput: CreateAssetInputDto;
};


export type MutationCreateAssetFromUploadArgs = {
  createAssetFromUploadInput: CreateAssetFromUploadInputDto;
};


export type MutationDeleteAssetArgs = {
  _id: Scalars['String']['input'];
};


export type MutationUpdateAssetArgs = {
  _id: Scalars['String']['input'];
  updateAssetInputDto: UpdateAssetInputDto;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  next_cursor?: Maybe<Scalars['String']['output']>;
  prev_cursor?: Maybe<Scalars['String']['output']>;
  total_pages: Scalars['Float']['output'];
};

export type PaginatedAssetResponse = {
  __typename?: 'PaginatedAssetResponse';
  assets: Array<AssetMinimalResponse>;
  page_info: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  GetAsset: Asset;
  ListAsset: PaginatedAssetResponse;
};


export type QueryGetAssetArgs = {
  getAssetInputDto: GetAssetInputDto;
};


export type QueryListAssetArgs = {
  listAssetInputDto: ListAssetInputDto;
};

export type StatusLogResponse = {
  __typename?: 'StatusLogResponse';
  created_at: Scalars['DateTime']['output'];
  details: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type UpdateAssetInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type Asset = {
  __typename?: 'Asset';
  _id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duration: Scalars['Float']['output'];
  height: Scalars['Float']['output'];
  latest_status: Scalars['String']['output'];
  master_playlist_url?: Maybe<Scalars['String']['output']>;
  size: Scalars['Float']['output'];
  status_logs: Array<StatusLogResponse>;
  tags: Array<Scalars['String']['output']>;
  thumbnail_url?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
  width: Scalars['Float']['output'];
};

export type AssetMinimalResponse = {
  __typename?: 'AssetMinimalResponse';
  _id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  duration: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  thumbnail_url?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type CreateAssetFromUploadInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  file_name: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAssetInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  source_url: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAssetResponse = {
  __typename?: 'CreateAssetResponse';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  source_url: Scalars['String']['output'];
  status: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type GetAssetInputDto = {
  _id: Scalars['String']['input'];
};

export type ListAssetInputDto = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Float']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  CreateAsset: CreateAssetResponse;
  CreateAssetFromUpload: CreateAssetResponse;
  DeleteAsset: Scalars['String']['output'];
  UpdateAsset: Asset;
};


export type MutationCreateAssetArgs = {
  createAssetInput: CreateAssetInputDto;
};


export type MutationCreateAssetFromUploadArgs = {
  createAssetFromUploadInput: CreateAssetFromUploadInputDto;
};


export type MutationDeleteAssetArgs = {
  _id: Scalars['String']['input'];
};


export type MutationUpdateAssetArgs = {
  _id: Scalars['String']['input'];
  updateAssetInputDto: UpdateAssetInputDto;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  next_cursor?: Maybe<Scalars['String']['output']>;
  prev_cursor?: Maybe<Scalars['String']['output']>;
  total_pages: Scalars['Float']['output'];
};

export type PaginatedAssetResponse = {
  __typename?: 'PaginatedAssetResponse';
  assets: Array<AssetMinimalResponse>;
  page_info: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  GetAsset: Asset;
  ListAsset: PaginatedAssetResponse;
};


export type QueryGetAssetArgs = {
  getAssetInputDto: GetAssetInputDto;
};


export type QueryListAssetArgs = {
  listAssetInputDto: ListAssetInputDto;
};

export type StatusLogResponse = {
  __typename?: 'StatusLogResponse';
  created_at: Scalars['DateTime']['output'];
  details: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type UpdateAssetInputDto = {
  description?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};
