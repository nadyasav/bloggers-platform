import {
  loginValidation,
  passwordValidation,
  emailValidation,
} from '../../core/validation/user-fields.validation';

export const userValidation = [
  loginValidation,
  passwordValidation,
  emailValidation,
];
