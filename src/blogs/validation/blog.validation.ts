import { BlogInputDto } from '../dto/blog-input.dto';
import { FieldError } from '../../core/types/error.types';

const BLOG_KEYS = {
  name: 'name',
  description: 'description',
  websiteUrl: 'websiteUrl',
};

const WEBSITE_URL_REGEX =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

const validateName = (name: string): FieldError | null => {
  if (!name || name.trim().length === 0) {
    return { message: `${BLOG_KEYS.name} is required`, field: BLOG_KEYS.name };
  }

  if (name.length > 15) {
    return {
      message: `${BLOG_KEYS.name} must be at most 15 characters`,
      field: BLOG_KEYS.name,
    };
  }

  return null;
};

const validateDescription = (description: string): FieldError | null => {
  if (!description || description.trim().length === 0) {
    return {
      message: `${BLOG_KEYS.description} is required`,
      field: BLOG_KEYS.description,
    };
  }

  if (description.length > 500) {
    return {
      message: `${BLOG_KEYS.description} must be at most 500 characters`,
      field: BLOG_KEYS.description,
    };
  }

  return null;
};

const validateWebsiteUrl = (websiteUrl: string): FieldError | null => {
  if (!websiteUrl || websiteUrl.trim().length === 0) {
    return {
      message: `${BLOG_KEYS.websiteUrl} is required`,
      field: BLOG_KEYS.websiteUrl,
    };
  }

  if (websiteUrl.length > 100) {
    return {
      message: `${BLOG_KEYS.websiteUrl} must be at most 100 characters`,
      field: BLOG_KEYS.websiteUrl,
    };
  }

  if (!WEBSITE_URL_REGEX.test(websiteUrl)) {
    return {
      message: `${BLOG_KEYS.websiteUrl} invalid URL format`,
      field: BLOG_KEYS.websiteUrl,
    };
  }

  return null;
};

export const validateBlog = (body: BlogInputDto): FieldError[] => {
  const errors = [
    validateName(body.name),
    validateDescription(body.description),
    validateWebsiteUrl(body.websiteUrl),
  ];

  const filteredErrors = errors.filter(
    (error): error is FieldError => error !== null,
  );
  return filteredErrors;
};
