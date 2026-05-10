export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type QueryParamsDto = {
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
};
