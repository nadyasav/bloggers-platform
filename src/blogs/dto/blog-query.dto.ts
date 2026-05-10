import { QueryParamsDto } from '../../core/dto/query-params.dto';

export enum BlogSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
  IsMembership = 'isMembership',
}

export type BlogQueryDto = QueryParamsDto & {
  searchNameTerm: string | null;
};
