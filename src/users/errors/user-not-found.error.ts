import { NotFoundError } from '../../core/errors/not-found.error';
import { USER_NOT_FOUND } from '../user.constants';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super(USER_NOT_FOUND);
    this.name = 'UserNotFoundError';
  }
}
