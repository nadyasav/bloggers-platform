import { QueryParamsDto } from '../../core/dto/query-params.dto';

export enum UserSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export type UserQueryDto = QueryParamsDto & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};
