import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, Transform } from 'class-transformer';
import { StatusLogResponse } from '@/src/api/assets/models/status-logs.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class CreateAssetResponse {
  @Field()
  _id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  source_url: string;

  @Field()
  status: string;

  @Field(() => [String])
  tags: string[];
}

@ObjectType()
export class Asset {
  @Field()
  @Expose()
  _id: string;

  @Field()
  @Expose()
  title: string;

  @Field({ nullable: true })
  @Expose()
  description: string;

  @Field()
  @Expose()
  @Transform((value) => value.obj.duration ?? 0)
  duration: number;

  @Field()
  @Expose()
  @Transform((value) => value.obj.height ?? 0)
  height: number;

  @Field()
  @Expose()
  @Transform((value) => value.obj.width ?? 0)
  width: number;

  // @Field({ nullable: true })
  // @Expose()
  // @Transform((value) => value.obj.thumbnail_url ?? null)
  // thumbnail_url: string;

  @Field()
  @Expose()
  @Transform((value) => value.obj.size ?? 0)
  size: number;

  @Field({ nullable: true })
  @Expose()
  @Transform((value) => value.obj.master_playlist_url ?? null)
  master_playlist_url: string;

  @Field()
  @Expose()
  latest_status: string;

  @Field(() => [StatusLogResponse])
  @Expose()
  @Transform((value) => value.obj.status_logs ?? [])
  status_logs: StatusLogResponse[];

  @Field(() => [String])
  @Expose()
  tags: string[];

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}

@ObjectType()
export class AssetMinimalResponse {
  @Field()
  @Expose()
  _id: string;

  @Field()
  @Expose()
  title: string;

  @Field()
  @Expose()
  @Transform((value) => value.obj.duration ?? 0)
  duration: number;

  @Field({ nullable: true })
  @Expose()
  @Transform((value) => value.obj.thumbnail_url ?? null)
  thumbnail_url: string;

  @Field()
  @Expose()
  status: string;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  @Expose()
  prev_cursor: string;

  @Field({ nullable: true })
  @Expose()
  next_cursor: string;

  @Field()
  @Expose()
  total_pages: number;
}

@ObjectType()
export class PaginatedAssetResponse {
  @Field((type) => [Asset])
  @Expose()
  assets: Asset[];

  @Field((type) => PageInfo)
  @Expose()
  page_info: PageInfo;
}

@ObjectType()
export class PlaylistSignedUrlResponse {
  @Field()
  @Expose()
  main_playlist_url: string;

  @Field(() => GraphQLJSON)
  @Expose()
  resolutions_token: Record<string, string>;
}
