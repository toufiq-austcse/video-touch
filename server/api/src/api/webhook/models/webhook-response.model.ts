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
  webhook_id: string;

  @Field()
  @Expose()
  identification_type: string;

  @Field()
  @Expose()
  identification_value: string;

  @Field()
  @Expose()
  event_type: string;

  @Field(() => GraphQLJSON)
  @Expose()
  payload: Record<string, any>;

  @Field()
  @Expose()
  status: string;

  @Field(() => GraphQLJSON)
  @Expose()
  response: Record<string, any>;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}
