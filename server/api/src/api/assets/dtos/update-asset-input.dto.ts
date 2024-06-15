import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateAssetInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags: string[];
}
