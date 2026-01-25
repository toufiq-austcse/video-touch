import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class WebhookResponse {
  @Field()
  @Expose()
  _id: string;

  @Field()
  @Expose()
  user_id: string;

  @Field()
  @Expose()
  asset_id: string;

  @Field()
  @Expose()
  event_type: string;

  @Field(() => GraphQLJSON)
  @Expose()
  req_body: Record<string, any>;

  @Field()
  @Expose()
  status: string;

  @Field(() => GraphQLJSON)
  @Expose()
  response_body: Record<string, any>;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}
