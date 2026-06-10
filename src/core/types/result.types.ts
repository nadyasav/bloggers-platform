export enum ResultStatus {
  Success = 'Success',
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
}

export type ExtensionType = {
  field: string | null;
  message: string;
};

export type SuccessResult<T> = {
  status: ResultStatus.Success;
  data: T;
  extensions: ExtensionType[];
};

export type ErrorResult = {
  status: Exclude<ResultStatus, ResultStatus.Success>;
  data: null;
  extensions: ExtensionType[];
  errorMessage?: string;
};

export type Result<T = null> = SuccessResult<T> | ErrorResult;
