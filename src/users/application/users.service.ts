import { bcryptService } from '../../core/services/bcrypt.service';
import { Result, ResultStatus } from '../../core/types/result.types';
import { UserInputDto } from '../dto/user-input.dto';
import { UserNotFoundError } from '../errors/user-not-found.error';
import { usersRepository } from '../repositories/users.repository';

export const usersService = {
  async create(dto: UserInputDto): Promise<Result<string | null>> {
    const extensions = [];

    const existingLogin = await usersRepository.getByLogin(dto.login);
    if (existingLogin) {
      extensions.push({ field: 'login', message: 'login should be unique' });
    }

    const existingEmail = await usersRepository.getByEmail(dto.email);
    if (existingEmail) {
      extensions.push({ field: 'email', message: 'email should be unique' });
    }

    if (extensions.length > 0) {
      return { status: ResultStatus.BadRequest, extensions, data: null };
    }

    const passwordHash = await bcryptService.generateHash(dto.password);
    const id = await usersRepository.create(dto, passwordHash);
    return { status: ResultStatus.Success, extensions: [], data: id };
  },

  async delete(id: string): Promise<Result> {
    try {
      await usersRepository.delete(id);
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
  },
};
