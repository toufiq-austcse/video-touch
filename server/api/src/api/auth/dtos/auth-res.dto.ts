import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Token {
  @ApiProperty()
  @Expose()
  access_token: string;

  @ApiProperty()
  @Expose()
  expires_at: number;
}

export class AuthResDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  token: Token;
}

export class UserResDto {
  @ApiProperty()
  @Expose()
  _id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;

}