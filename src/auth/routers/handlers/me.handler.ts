import { Request, Response } from 'express';
import { usersQueryRepository } from '../../../users/repositories/users.query-repository';
import { mapUserDbToMeView } from '../mappers/userdb-to-me-view.mapper';

export async function meHandler(req: Request, res: Response) {
  const user = await usersQueryRepository.getById(req.userId as string);

  if (!user) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  res.status(200).send(mapUserDbToMeView(user));
}
