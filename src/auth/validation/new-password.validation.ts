import { body } from 'express-validator';
import { createPasswordValidation } from '../../core/validation/user-fields.validation';

const KEYS = {
  newPassword: 'newPassword',
  recoveryCode: 'recoveryCode',
};

const newPasswordFieldValidation = createPasswordValidation(KEYS.newPassword);

const recoveryCodeValidation = body(KEYS.recoveryCode)
  .exists()
  .withMessage(`${KEYS.recoveryCode} is required`)
  .isString()
  .withMessage(`${KEYS.recoveryCode} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${KEYS.recoveryCode} is required`);

export const newPasswordValidation = [
  newPasswordFieldValidation,
  recoveryCodeValidation,
];
