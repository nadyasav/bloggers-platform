import { QueryParamsDto } from '../../core/dto/query-params.dto';

export enum PostSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogName = 'blogName',
}

export type PostQueryDto = QueryParamsDto;
