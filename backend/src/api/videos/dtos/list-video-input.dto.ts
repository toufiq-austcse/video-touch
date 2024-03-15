import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class ListVideoInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  after: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  first: number = 30;
}
