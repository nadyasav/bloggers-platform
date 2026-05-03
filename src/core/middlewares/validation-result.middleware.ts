import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { FieldError } from '../types/error.types';

const formatErrors = (error: ValidationError): FieldError => {
  const expressError = error as unknown as FieldValidationError;
  return {
    field: expressError.path,
    message: expressError.msg,
  };
};

export const validationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(400).json({ errorsMessages: errors });
    return;
  }

  next();
};
