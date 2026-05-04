import { body } from 'express-validator';

const POST_KEYS = {
  title: 'title',
  shortDescription: 'shortDescription',
  content: 'content',
  blogId: 'blogId',
};

const titleValidation = body(POST_KEYS.title)
  .exists()
  .withMessage(`${POST_KEYS.title} is required`)
  .isString()
  .withMessage(`${POST_KEYS.title} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${POST_KEYS.title} is required`)
  .isLength({ max: 30 })
  .withMessage(`${POST_KEYS.title} must be at most 30 characters`);

const shortDescriptionValidation = body(POST_KEYS.shortDescription)
  .exists()
  .withMessage(`${POST_KEYS.shortDescription} is required`)
  .isString()
  .withMessage(`${POST_KEYS.shortDescription} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${POST_KEYS.shortDescription} is required`)
  .isLength({ max: 100 })
  .withMessage(`${POST_KEYS.shortDescription} must be at most 100 characters`);

const contentValidation = body(POST_KEYS.content)
  .exists()
  .withMessage(`${POST_KEYS.content} is required`)
  .isString()
  .withMessage(`${POST_KEYS.content} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${POST_KEYS.content} is required`)
  .isLength({ max: 1000 })
  .withMessage(`${POST_KEYS.content} must be at most 1000 characters`);

const blogIdValidation = body(POST_KEYS.blogId)
  .exists()
  .withMessage(`${POST_KEYS.blogId} is required`)
  .isString()
  .withMessage(`${POST_KEYS.blogId} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${POST_KEYS.blogId} is required`);

export const postValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
];
