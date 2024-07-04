import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenDetails {
  @ApiProperty()
  @Expose()
  access_token: string;

  @ApiProperty()
  @Expose()
  expire_in_sec: number;
}

export class SignupResDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  token_details: TokenDetails;
}
