import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class RecreateAssetInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  _id?: string;
}

@InputType()
export class CreateAssetInputDto {
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

  @IsOptional()
  @IsEmail()
  email?: string;
}

@InputType()
export class CreateAssetFromUploadInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  file_name: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
