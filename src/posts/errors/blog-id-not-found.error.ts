import { BLOG_NOT_FOUND } from '../../blogs/blog.constants';

export class BlogIdNotFoundError extends Error {
  statusCode = 400;

  constructor() {
    super(BLOG_NOT_FOUND);
    this.name = 'BlogIdNotFoundError';
  }
}
