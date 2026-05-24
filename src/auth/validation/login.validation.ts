import { body } from 'express-validator';

const KEYS = {
  loginOrEmail: 'loginOrEmail',
  password: 'password',
};

export const loginValidation = [
  body(KEYS.loginOrEmail)
    .exists()
    .withMessage(`${KEYS.loginOrEmail} is required`)
    .isString()
    .withMessage(`${KEYS.loginOrEmail} should be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${KEYS.loginOrEmail} is required`),

  body(KEYS.password)
    .exists()
    .withMessage(`${KEYS.password} is required`)
    .isString()
    .withMessage(`${KEYS.password} should be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${KEYS.password} is required`),
];
