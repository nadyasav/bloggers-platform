import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../repositories/users.query-repository';
import { UserInputDto } from '../dto/user-input.dto';
import { ResultStatus } from '../../core/types/result.types';
import { mapUserDbToUser } from './mappers/userdb-to-user.mapper';
import { UserQueryDto } from '../dto/user-query.dto';
import { mapItemsToPaginated } from '../../core/mappers/items-to-paginated.mapper';

export class UsersController {
  private usersService: UsersService;
  private usersQueryRepository: UsersQueryRepository;

  constructor(
    usersService: UsersService,
    usersQueryRepository: UsersQueryRepository,
  ) {
    this.usersService = usersService;
    this.usersQueryRepository = usersQueryRepository;
  }

  async getUsersHandler(req: Request, res: Response) {
    const query = matchedData<UserQueryDto>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const { users, totalCount } = await this.usersQueryRepository.getAll(query);

    const result = mapItemsToPaginated(
      users.map(mapUserDbToUser),
      totalCount,
      query,
    );

    res.status(200).send(result);
  }

  async createUserHandler(req: Request<{}, {}, UserInputDto>, res: Response) {
    const result = await this.usersService.create(req.body);

    if (result.status === ResultStatus.BadRequest) {
      return res.status(400).send({ errorsMessages: result.extensions });
    }

    const user = await this.usersQueryRepository.getById(result.data!);

    if (!user) {
      throw new Error();
    }

    res.status(201).send(mapUserDbToUser(user));
  }

  async deleteUserHandler(req: Request<{ id: string }>, res: Response) {
    const result = await this.usersService.delete(req.params.id);

    if (result.status === ResultStatus.NotFound) {
      return res.status(404).send({ message: result.errorMessage });
    }

    res.sendStatus(204);
  }
}
