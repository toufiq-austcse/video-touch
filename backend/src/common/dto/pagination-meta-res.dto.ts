import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginationResMeta {
  @ApiProperty()
  @Expose()
  itemCount: number;

  @ApiProperty()
  @Expose()
  totalItems: number;

  @ApiProperty()
  @Expose()
  itemsPerPage: number;

  @ApiProperty()
  @Expose()
  totalPages: number;

  @ApiProperty()
  @Expose()
  currentPage: number;
}

export class PaginationMetaDto {
  @ApiProperty()
  @Expose()
  pagination_meta: PaginationResMeta;
}
