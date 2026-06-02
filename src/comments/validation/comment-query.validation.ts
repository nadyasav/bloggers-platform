import { paginationSortingValidation } from '../../core/validation/pagination-sorting.validation';
import { CommentSortBy } from '../dto/comment-query.dto';

const DEFAULT = {
  sortBy: CommentSortBy.CreatedAt,
};

export const commentQueryValidation = paginationSortingValidation(
  CommentSortBy,
  DEFAULT.sortBy,
);
