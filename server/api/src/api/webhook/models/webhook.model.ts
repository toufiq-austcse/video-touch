import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class Webhook {
  @Field()
  @Expose()
  _id: string;

  @Field()
  @Expose()
  url: string;

  @Field({
    nullable: true,
  })
  @Expose()
  secret_token: string;

  @Field()
  @Expose()
  created_at: Date;

  @Field()
  @Expose()
  updated_at: Date;
}
