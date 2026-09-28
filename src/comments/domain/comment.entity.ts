import { HydratedDocument, Model, model, Schema } from 'mongoose';
import { CommentDb } from '../types/comment.types';

type CommentModel = Model<CommentDb>;

export type CommentDocument = HydratedDocument<CommentDb>;

const commentSchema = new Schema<CommentDb>(
  {
    content: { type: String, required: true },
    postId: { type: String, required: true },
    commentatorInfo: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    createdAt: { type: Date, required: true },
    likesCounters: {
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
    },
  },
  { versionKey: false },
);

export const CommentModel = model<CommentDb, CommentModel>(
  'Comment',
  commentSchema,
  'comments',
);
