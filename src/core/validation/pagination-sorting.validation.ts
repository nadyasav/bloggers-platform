import { query } from 'express-validator';
import { SortDirection } from '../dto/query-params.dto';

const QUERY_KEYS = {
  pageNumber: 'pageNumber',
  pageSize: 'pageSize',
  sortBy: 'sortBy',
  sortDirection: 'sortDirection',
};

const DEFAULT = {
  pageNumber: 1,
  pageSize: 10,
  sortDirection: SortDirection.Desc,
};

export function paginationSortingValidation(
  sortByEnum: Record<string, string>,
  sortByDefault: string,
) {
  const sortByValues = Object.values(sortByEnum);

  return [
    query(QUERY_KEYS.pageNumber)
      .default(DEFAULT.pageNumber)
      .isInt({ min: 1 })
      .withMessage(`${QUERY_KEYS.pageNumber} must be an integer greater than 0`)
      .toInt(),
    query(QUERY_KEYS.pageSize)
      .default(DEFAULT.pageSize)
      .isInt({ min: 1 })
      .withMessage(`${QUERY_KEYS.pageSize} must be an integer greater than 0`)
      .toInt(),
    query(QUERY_KEYS.sortBy)
      .default(sortByDefault)
      .isIn(sortByValues)
      .withMessage(
        `${QUERY_KEYS.sortBy} must be one of the following values: ${sortByValues.join(', ')}`,
      ),
    query(QUERY_KEYS.sortDirection)
      .default(DEFAULT.sortDirection)
      .isIn(Object.values(SortDirection))
      .withMessage(
        `${QUERY_KEYS.sortDirection} must be one of the following values: ${Object.values(SortDirection).join(', ')}`,
      ),
  ];
}
