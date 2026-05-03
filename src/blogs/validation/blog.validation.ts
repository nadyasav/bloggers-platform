import { body } from 'express-validator';

const BLOG_KEYS = {
  name: 'name',
  description: 'description',
  websiteUrl: 'websiteUrl',
};

const WEBSITE_URL_REGEX =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

const nameValidation = body(BLOG_KEYS.name)
  .exists()
  .withMessage(`${BLOG_KEYS.name} is required`)
  .isString()
  .withMessage(`${BLOG_KEYS.name} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${BLOG_KEYS.name} is required`)
  .isLength({ max: 15 })
  .withMessage(`${BLOG_KEYS.name} must be at most 15 characters`);

const descriptionValidation = body(BLOG_KEYS.description)
  .exists()
  .withMessage(`${BLOG_KEYS.description} is required`)
  .isString()
  .withMessage(`${BLOG_KEYS.description} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${BLOG_KEYS.description} is required`)
  .isLength({ max: 500 })
  .withMessage(`${BLOG_KEYS.description} must be at most 500 characters`);

const websiteUrlValidation = body(BLOG_KEYS.websiteUrl)
  .exists()
  .withMessage(`${BLOG_KEYS.websiteUrl} is required`)
  .isString()
  .withMessage(`${BLOG_KEYS.websiteUrl} should be a string`)
  .bail()
  .trim()
  .notEmpty()
  .withMessage(`${BLOG_KEYS.websiteUrl} is required`)
  .isLength({ max: 100 })
  .withMessage(`${BLOG_KEYS.websiteUrl} must be at most 100 characters`)
  .matches(WEBSITE_URL_REGEX)
  .withMessage(`${BLOG_KEYS.websiteUrl} invalid URL format`);

export const blogValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];
