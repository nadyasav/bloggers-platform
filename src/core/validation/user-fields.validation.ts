import { body } from 'express-validator';

const USER_KEYS = {
  login: 'login',
  password: 'password',
  email: 'email',
};

const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const loginValidation = body(USER_KEYS.login)
  .exists()
  .withMessage(`${USER_KEYS.login} is required`)
  .isString()
  .withMessage(`${USER_KEYS.login} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${USER_KEYS.login} is required`)
  .isLength({ min: 3, max: 10 })
  .withMessage(`${USER_KEYS.login} must be between 3 and 10 characters`)
  .matches(LOGIN_REGEX)
  .withMessage(
    `${USER_KEYS.login} must contain only letters, numbers, underscores or hyphens`,
  );

export const createPasswordValidation = (field: string) =>
  body(field)
    .exists()
    .withMessage(`${field} is required`)
    .isString()
    .withMessage(`${field} should be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ min: 6, max: 20 })
    .withMessage(`${field} must be between 6 and 20 characters`);

export const passwordValidation = createPasswordValidation(USER_KEYS.password);

export const emailValidation = body(USER_KEYS.email)
  .exists()
  .withMessage(`${USER_KEYS.email} is required`)
  .isString()
  .withMessage(`${USER_KEYS.email} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${USER_KEYS.email} is required`)
  .matches(EMAIL_REGEX)
  .withMessage(`${USER_KEYS.email} has invalid format`);
