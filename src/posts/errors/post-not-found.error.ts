import { NotFoundError } from '../../core/errors/not-found.error';
import { POST_NOT_FOUND } from '../post.constants';

export class PostNotFoundError extends NotFoundError {
  constructor() {
    super(POST_NOT_FOUND);
    this.name = 'PostNotFoundError';
  }
}
