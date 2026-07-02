import { paginationSortingValidation } from '../../core/validation/pagination-sorting.validation';
import { PostSortBy } from '../dto/post-query.dto';

const DEFAULT = {
  sortBy: PostSortBy.CreatedAt,
};

export const postQueryValidation = paginationSortingValidation(
  PostSortBy,
  DEFAULT.sortBy,
);
