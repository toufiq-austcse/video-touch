import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateVideoInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Field()
  @IsUrl()
  @IsNotEmpty()
  source_url: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags: string[];

}