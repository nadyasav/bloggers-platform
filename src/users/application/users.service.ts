import { inject, injectable } from 'inversify';
import { BcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { UserInputDto } from '../dto/user-input.dto';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { UsersRepository } from '../repositories/users.repository';
import { EmailConfirmation, UserDb } from '../types/user.types';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

@injectable()
export class UsersService {
  private usersRepository: UsersRepository;
  private bcryptService: BcryptService;

  constructor(
    @inject(UsersRepository) usersRepository: UsersRepository,
    @inject(BcryptService) bcryptService: BcryptService,
  ) {
    this.usersRepository = usersRepository;
    this.bcryptService = bcryptService;
  }

  async create(
    dto: UserInputDto,
    emailConfirmation?: EmailConfirmation,
  ): Promise<Result<string | null>> {
    const extensions = [];

    const existingLogin = await this.usersRepository.getByLogin(dto.login);
    if (existingLogin) {
      extensions.push({ field: 'login', message: 'login should be unique' });
    }

    const existingEmail = await this.usersRepository.getByEmail(dto.email);
    if (existingEmail) {
      extensions.push({ field: 'email', message: 'email should be unique' });
    }

    if (extensions.length > 0) {
      return { status: ResultStatus.BadRequest, extensions, data: null };
    }

    const passwordHash = await this.bcryptService.generateHash(dto.password);
    const user: UserDb = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      emailConfirmation: emailConfirmation ?? {
        code: '',
        expiresAt: new Date(),
        isConfirmed: true,
      },
      createdAt: new Date(),
    };

    try {
      const id = await this.usersRepository.create(user);
      return { status: ResultStatus.Success, extensions: [], data: id };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        return {
          status: ResultStatus.BadRequest,
          extensions: [{ field: error.duplicateField, message: error.message }],
          data: null,
        };
      }

      throw error;
    }
  }

  async delete(id: string): Promise<Result> {
    try {
      await this.usersRepository.delete(id);
      return { status: ResultStatus.Success, extensions: [], data: null };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return {
          status: ResultStatus.NotFound,
          errorMessage: error.message,
          extensions: [],
          data: null,
        };
      }

      throw error;
    }
  }
}
