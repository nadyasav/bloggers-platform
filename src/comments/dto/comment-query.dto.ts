import { QueryParamsDto } from '../../core/dto/query-params.dto';

export enum CommentSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}

export type CommentQueryDto = QueryParamsDto;
