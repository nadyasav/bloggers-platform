export class NotFoundError extends Error {
  statusCode = 404;

  constructor(message: string = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
