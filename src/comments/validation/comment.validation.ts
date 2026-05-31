import { body } from 'express-validator';

const COMMENT_KEYS = {
  content: 'content',
};

export const commentValidation = [
  body(COMMENT_KEYS.content)
    .exists()
    .withMessage(`${COMMENT_KEYS.content} is required`)
    .isString()
    .withMessage(`${COMMENT_KEYS.content} should be a string`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${COMMENT_KEYS.content} is required`)
    .isLength({ min: 20, max: 300 })
    .withMessage(
      `${COMMENT_KEYS.content} must be between 20 and 300 characters`,
    ),
];
