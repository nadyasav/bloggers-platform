import { body } from 'express-validator';
import { LikeStatus } from '../types/like.types';

const LIKE_KEYS = {
  likeStatus: 'likeStatus',
};

export const likeValidation = [
  body(LIKE_KEYS.likeStatus)
    .exists()
    .withMessage(`${LIKE_KEYS.likeStatus} is required`)
    .isString()
    .withMessage(`${LIKE_KEYS.likeStatus} should be a string`)
    .bail()
    .isIn(Object.values(LikeStatus))
    .withMessage(
      `${LIKE_KEYS.likeStatus} must be one of the following value: ${Object.values(LikeStatus).join(', ')}`,
    ),
];
