import { ExtensionType, Result, ResultStatus } from '../types/result.types';

type HttpError = {
  code: number;
  message: string;
};

export const resultStatusToHttpError = (status: ResultStatus): HttpError => {
  switch (status) {
    case ResultStatus.NotFound:
      return { code: 404, message: 'Not Found' };
    case ResultStatus.Unauthorized:
      return { code: 401, message: 'Unauthorized' };
    case ResultStatus.Forbidden:
      return { code: 403, message: 'Forbidden' };
    case ResultStatus.BadRequest:
      return { code: 400, message: 'Bad Request' };
    default:
      return { code: 500, message: 'Internal Server Error' };
  }
};

type ErrorResponseBody =
  | { errorsMessages: ExtensionType[] }
  | { message: string };

export const resultToErrorResponse = <T>(
  result: Result<T>,
): { code: number; body: ErrorResponseBody } => {
  const error = resultStatusToHttpError(result.status);
  const body =
    result.extensions.length > 0
      ? { errorsMessages: result.extensions }
      : { message: result.errorMessage ?? error.message };

  return { code: error.code, body };
};
