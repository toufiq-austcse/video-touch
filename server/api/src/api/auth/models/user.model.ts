import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class User {
  @ApiProperty()
  @Expose()
  @Field()
  _id: string;

  @ApiProperty()
  @Expose()
  @Field()
  name: string;

  @ApiProperty()
  @Expose()
  @Field()
  email: string;

  @ApiProperty()
  @Expose()
  @Field()
  createdAt: string;

  @ApiProperty()
  @Expose()
  @Field()
  updatedAt: string;
}
