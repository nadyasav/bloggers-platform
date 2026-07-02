import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { UserQueryDto } from '../../dto/user-query.dto';
import { usersQueryRepository } from '../../repositories/users.query-repository';
import { mapItemsToPaginated } from '../../../core/mappers/items-to-paginated.mapper';
import { mapUserDbToUser } from '../mappers/userdb-to-user.mapper';

export async function getUsersHandler(req: Request, res: Response) {
  const query = matchedData<UserQueryDto>(req, {
    locations: ['query'],
    includeOptionals: true,
  });
  const { users, totalCount } = await usersQueryRepository.getAll(query);

  const result = mapItemsToPaginated(
    users.map(mapUserDbToUser),
    totalCount,
    query,
  );

  res.status(200).send(result);
}
