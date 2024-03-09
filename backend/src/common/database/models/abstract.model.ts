import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AbstractModel {
  @Field()
  _id: string;
}