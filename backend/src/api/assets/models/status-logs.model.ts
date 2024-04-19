import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class StatusLogResponse {
  @Field()
  @Expose()
  status: string;

  @Field()
  @Expose()
  details: string;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}