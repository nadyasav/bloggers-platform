import { Request, Response } from 'express';
import { usersService } from '../../application/users.service';
import { ResultStatus } from '../../../core/types/result.types';

export async function deleteUserHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  const result = await usersService.delete(req.params.id);

  if (result.status === ResultStatus.NotFound) {
    return res.status(404).send({ message: result.errorMessage });
  }

  res.sendStatus(204);
}
