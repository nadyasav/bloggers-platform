import { NotFoundError } from '../../core/errors/not-found.error';
import { BLOG_NOT_FOUND } from '../blog.constants';

export class BlogNotFoundError extends NotFoundError {
  constructor() {
    super(BLOG_NOT_FOUND);
    this.name = 'BlogNotFoundError';
  }
}
