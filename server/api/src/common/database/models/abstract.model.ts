import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AbstractModel {
  @Field()
  _id: string;
}

export class PageInfo {
  prev_cursor: string;
  next_cursor: string;
  total_pages: number;
}

export class BasePaginatedResponse<T> {
  items: T[];
  pageInfo: PageInfo;
}
