import { PostInputDto } from '../dto/post-input.dto';
import { PostQueryDto } from '../dto/post-query.dto';
import { PostDb } from '../types/post.types';
import { ClientSession, ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../db/db';
import { PostNotFoundError } from '../errors/post-not-found.error';

export const postsRepository = {
  async getAll(
    query: PostQueryDto,
  ): Promise<{ posts: WithId<PostDb>[]; totalCount: number }> {
    const skipCount = (query.pageNumber - 1) * query.pageSize;

    const totalCount = await postsCollection.countDocuments();
    const posts = await postsCollection
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .toArray();

    return { posts, totalCount };
  },
  async getById(id: string): Promise<WithId<PostDb> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  },
  async create(dto: PostInputDto, blogName: string): Promise<WithId<PostDb>> {
    const newPost = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName,
      createdAt: new Date(),
    };

    const result = await postsCollection.insertOne(newPost);
    return { _id: result.insertedId, ...newPost };
  },
  async update(id: string, dto: PostInputDto, blogName: string): Promise<void> {
    const result = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
          blogName,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new PostNotFoundError();
    }
  },
  async delete(id: string): Promise<void> {
    const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new PostNotFoundError();
    }
  },
  async updateBlogNameField(
    blogId: string,
    blogName: string,
    session?: ClientSession,
  ): Promise<void> {
    await postsCollection.updateMany(
      { blogId },
      { $set: { blogName } },
      { session },
    );
  },

  async deleteByBlogId(blogId: string, session?: ClientSession): Promise<void> {
    await postsCollection.deleteMany({ blogId }, { session });
  },
};
