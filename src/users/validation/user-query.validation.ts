import { query } from 'express-validator';
import { paginationSortingValidation } from '../../core/validation/pagination-sorting.validation';
import { UserSortBy } from '../dto/user-query.dto';

const QUERY_KEYS = {
  searchLoginTerm: 'searchLoginTerm',
  searchEmailTerm: 'searchEmailTerm',
};

const DEFAULT = {
  searchLoginTerm: null,
  searchEmailTerm: null,
  sortBy: UserSortBy.CreatedAt,
};

export const userQueryValidation = [
  ...paginationSortingValidation(UserSortBy, DEFAULT.sortBy),
  query(QUERY_KEYS.searchLoginTerm).default(DEFAULT.searchLoginTerm),
  query(QUERY_KEYS.searchEmailTerm).default(DEFAULT.searchEmailTerm),
];
