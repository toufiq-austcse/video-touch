import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class UpdateWebhookInputDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsUrl()
  url: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  secret_token: string;
}

