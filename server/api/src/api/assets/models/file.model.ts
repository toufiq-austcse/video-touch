import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

export interface HeightWidthMap {
  height: number;
  width: number;
}

@ObjectType()
export class File {
  @Field()
  @Expose()
  _id: string;

  @Field()
  @Expose()
  height: number;

  @Field()
  @Expose()
  width: number;

  @Field()
  @Expose()
  latest_status: string;

  @Field()
  @Expose()
  name: string;

  @Field()
  @Expose()
  size: number;

  @Field()
  @Expose()
  type: string;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}
