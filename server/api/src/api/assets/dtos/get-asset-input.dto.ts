import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class GetAssetInputDto {
  @IsString()
  @IsNotEmpty()
  @Field()
  _id: string;
}
