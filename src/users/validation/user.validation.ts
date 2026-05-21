import { body } from 'express-validator';

const USER_KEYS = {
  login: 'login',
  password: 'password',
  email: 'email',
};

const LOGIN_REGEX = /^[a-zA-Z0-9_-]*$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const loginValidation = body(USER_KEYS.login)
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

const passwordValidation = body(USER_KEYS.password)
  .exists()
  .withMessage(`${USER_KEYS.password} is required`)
  .isString()
  .withMessage(`${USER_KEYS.password} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${USER_KEYS.password} is required`)
  .isLength({ min: 6, max: 20 })
  .withMessage(`${USER_KEYS.password} must be between 6 and 20 characters`);

const emailValidation = body(USER_KEYS.email)
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

export const userValidation = [
  loginValidation,
  passwordValidation,
  emailValidation,
];
