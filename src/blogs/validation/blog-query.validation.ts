import { query } from 'express-validator';
import { paginationSortingValidation } from '../../core/validation/pagination-sorting.validation';
import { BlogSortBy } from '../dto/blog-query.dto';

const QUERY_KEYS = {
  searchNameTerm: 'searchNameTerm',
};

const DEFAULT = {
  searchNameTerm: null,
  sortBy: BlogSortBy.CreatedAt,
};

export const blogQueryValidation = [
  ...paginationSortingValidation(BlogSortBy, DEFAULT.sortBy),
  query(QUERY_KEYS.searchNameTerm)
    .default(DEFAULT.searchNameTerm)
    .optional({ nullable: true })
    .isString()
    .withMessage(`${QUERY_KEYS.searchNameTerm} must be a string`),
];
