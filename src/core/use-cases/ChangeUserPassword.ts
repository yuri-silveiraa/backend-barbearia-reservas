import bcrypt from "bcrypt";
import { ChangeUserPasswordDTO } from "../dtos/ChangeUserPasswordDTO";
import { AppError } from "../errors/AppError";
import { UserNotFoundError } from "../errors/UserNotFoundError";
import { IUserRepository } from "../repositories/IUserRepository";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export class ChangeUserPassword {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: ChangeUserPasswordDTO) {
    const user = await this.usersRepository.findById(data.userId);
    if (!user) throw new UserNotFoundError();

    if (data.newPassword !== data.confirmPassword) {
      throw new AppError("As senhas não coincidem");
    }

    if (!PASSWORD_PATTERN.test(data.newPassword)) {
      throw new AppError("Senha deve ter no mínimo 6 caracteres, uma letra maiúscula, uma minúscula e um número");
    }

    if (user.password) {
      if (!data.currentPassword) {
        throw new AppError("Senha atual é obrigatória");
      }

      const currentPasswordMatches = await bcrypt.compare(data.currentPassword, user.password);
      if (!currentPasswordMatches) {
        throw new AppError("Senha atual incorreta", 401);
      }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.usersRepository.update(data.userId, { password: hashedPassword });

    const updated = await this.usersRepository.getMe(data.userId);
    if (!updated) throw new UserNotFoundError();

    return updated;
  }
}
