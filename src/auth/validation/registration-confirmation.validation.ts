import { body } from 'express-validator';

const KEYS = {
  code: 'code',
};

export const registrationConfirmationValidation = [
  body(KEYS.code)
    .exists()
    .withMessage(`${KEYS.code} is required`)
    .isString()
    .withMessage(`${KEYS.code} should be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${KEYS.code} is required`)
    .isUUID('4')
    .withMessage(`${KEYS.code} must be a valid UUID`),
];
