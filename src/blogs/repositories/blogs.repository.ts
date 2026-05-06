import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogDb } from '../types/blog.types';
import { NotFoundError } from '../../core/errors/not-found.error';
import { BLOG_NOT_FOUND } from '../blog.constants';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/db';

export const blogsRepository = {
  async getAll(): Promise<WithId<BlogDb>[]> {
    return blogsCollection.find().toArray();
  },
  async getById(id: string): Promise<WithId<BlogDb> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },
  async create(dto: BlogInputDto): Promise<WithId<BlogDb>> {
    const newBlog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    const result = await blogsCollection.insertOne(newBlog);
    return { _id: result.insertedId, ...newBlog };
  },
  async update(id: string, dto: BlogInputDto): Promise<void> {
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }
  },
  async delete(id: string): Promise<void> {
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }
  },
};
