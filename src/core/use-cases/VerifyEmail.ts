import { IUserRepository } from "../repositories/IUserRepository";

export interface VerifyEmailDTO {
  code: string;
}

export class VerifyEmail {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: VerifyEmailDTO): Promise<{ success: boolean; message: string; userId?: string }> {
    const user = await this.usersRepository.findByEmailCode(data.code);

    if (!user) {
      return { success: false, message: "Código inválido ou expirado" };
    }

    await this.usersRepository.updateEmailVerification(user.id, true);

    return { success: true, message: "Email verificado com sucesso!", userId: user.id };
  }
}
