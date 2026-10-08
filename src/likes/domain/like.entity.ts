import { HydratedDocument, Model, model, Schema } from 'mongoose';
import { LikeDb, LikeStatus } from '../types/like.types';

type LikeModel = Model<LikeDb>;

export type LikeDocument = HydratedDocument<LikeDb>;

const likeSchema = new Schema<LikeDb>(
  {
    parentId: { type: String, required: true },
    authorId: { type: String, required: true },
    status: { type: String, enum: LikeStatus, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false },
);

export const LikeModel = model<LikeDb, LikeModel>('Like', likeSchema, 'likes');
