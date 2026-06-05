import {
  loginValidation,
  passwordValidation,
  emailValidation,
} from '../../core/validation/user-fields.validation';

export const registrationValidation = [
  loginValidation,
  passwordValidation,
  emailValidation,
];
