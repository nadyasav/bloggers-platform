import { PaginatedResponse } from '../types/paginated-response.type';
import { QueryParamsDto } from '../dto/query-params.dto';

export function mapItemsToPaginated<T>(
  items: T[],
  totalCount: number,
  query: QueryParamsDto,
): PaginatedResponse<T> {
  return {
    pagesCount: Math.ceil(totalCount / query.pageSize),
    page: query.pageNumber,
    pageSize: query.pageSize,
    totalCount,
    items,
  };
}
