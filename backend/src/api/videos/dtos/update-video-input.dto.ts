import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateVideoInputDto {

  @Field({nullable:true})
  @IsString()
  @IsOptional()
  title: string;

  @Field({nullable:true})
  @IsString()
  @IsOptional()
  description: string;

  @Field(() => [String],{nullable:true})
  @IsString()
  @IsOptional()
  tags: string[];

}