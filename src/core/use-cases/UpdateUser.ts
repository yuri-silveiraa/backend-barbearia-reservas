import { UpdateUserDTO } from "../dtos/UpdateUserDTO";
import { UserAlreadyExistsError } from "../errors/UserAlreadyExistsError";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { IUserRepository } from "../repositories/IUserRepository";
import { formatName } from "../utils/formatName";

export class UpdateUser {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: UpdateUserDTO) {
    const user = await this.usersRepository.findById(data.userId);
    if (!user) throw new UserNotFoundError();

    if (data.email && data.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(data.email);
      if (existing && existing.id !== user.id) {
        throw new UserAlreadyExistsError(data.email);
      }
    }

    await this.usersRepository.update(data.userId, {
      name: data.name ? formatName(data.name) : user.name,
      email: data.email ?? user.email,
      telephone: data.telephone ?? user.telephone,
    });

    const updated = await this.usersRepository.getMe(data.userId);
    if (!updated) throw new UserNotFoundError();
    return updated;
  }
}
