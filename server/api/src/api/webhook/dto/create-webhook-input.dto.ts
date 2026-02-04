import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateWebhookInputDto {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  secret_token: string;
}
