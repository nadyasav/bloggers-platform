import { PostInputDto } from './post-input.dto';

export type BlogPostInputDto = Omit<PostInputDto, 'blogId'>;
