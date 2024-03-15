import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GetVideoInputDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  _id: string;
}