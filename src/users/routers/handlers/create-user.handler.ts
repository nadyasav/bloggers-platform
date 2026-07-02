import { Request, Response } from 'express';
import { UserInputDto } from '../../dto/user-input.dto';
import { usersService } from '../../application/users.service';
import { usersQueryRepository } from '../../repositories/users.query-repository';
import { mapUserDbToUser } from '../mappers/userdb-to-user.mapper';
import { ResultStatus } from '../../../core/types/result.types';

export async function createUserHandler(
  req: Request<{}, {}, UserInputDto>,
  res: Response,
) {
  const result = await usersService.create(req.body);

  if (result.status === ResultStatus.BadRequest) {
    return res.status(400).send({ errorsMessages: result.extensions });
  }

  const user = await usersQueryRepository.getById(result.data!);

  if (!user) {
    throw new Error();
  }

  res.status(201).send(mapUserDbToUser(user));
}
