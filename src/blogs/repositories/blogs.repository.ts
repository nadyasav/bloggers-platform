import { BlogInputDto } from '../dto/blog-input.dto';
import { BlogDb } from '../types/blog.types';
import { NotFoundError } from '../../core/errors/not-found.error';
import { BLOG_NOT_FOUND } from '../blog.constants';
import { ClientSession, ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/db';
import { BlogQueryDto } from '../dto/blog-query.dto';

export const blogsRepository = {
  async getAll(
    query: BlogQueryDto,
  ): Promise<{ blogs: WithId<BlogDb>[]; totalCount: number }> {
    const nameSearchFilter = query.searchNameTerm
      ? { name: { $regex: query.searchNameTerm, $options: 'i' } }
      : {};
    const skipCount = (query.pageNumber - 1) * query.pageSize;

    const totalCount = await blogsCollection.countDocuments(nameSearchFilter);
    const blogs = await blogsCollection
      .find(nameSearchFilter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(skipCount)
      .limit(query.pageSize)
      .toArray();

    return { blogs, totalCount };
  },
  async getById(id: string): Promise<WithId<BlogDb> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },
  async create(dto: BlogInputDto): Promise<WithId<BlogDb>> {
    const newBlog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };

    const result = await blogsCollection.insertOne(newBlog);
    return { _id: result.insertedId, ...newBlog };
  },
  async update(
    id: string,
    dto: BlogInputDto,
    session?: ClientSession,
  ): Promise<void> {
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }
  },
  async delete(id: string, session?: ClientSession): Promise<void> {
    const result = await blogsCollection.deleteOne(
      { _id: new ObjectId(id) },
      { session },
    );

    if (result.deletedCount === 0) {
      throw new NotFoundError(BLOG_NOT_FOUND);
    }
  },
};
