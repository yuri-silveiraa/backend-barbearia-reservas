import { IUserRepository } from "../repositories/IUserRepository";
import { prisma } from "../../infra/database/prisma/prismaClient";
import { sendVerificationEmail } from "../../infra/email/mailer";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface ResendEmailCodeDTO {
  email: string;
}

export class ResendEmailCode {
  constructor(private usersRepository: IUserRepository) {}

  async execute(data: ResendEmailCodeDTO): Promise<{ success: boolean; message: string }> {
    const user = await this.usersRepository.findByEmail(data.email);

    if (!user) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (user.emailVerified) {
      return { success: false, message: "Email já verificado" };
    }

    const lastCodeSent = await prisma.user.findFirst({
      where: {
        id: user.id,
        emailCodeCooldownExpires: { gt: new Date() },
      },
    });

    if (lastCodeSent) {
      const timeUntilExpiry = new Date(lastCodeSent.emailCodeCooldownExpires!).getTime() - Date.now();
      const secondsLeft = Math.ceil(timeUntilExpiry / 1000);
      return { 
        success: false, 
        message: `Aguarde ${secondsLeft} segundos antes de solicitar um novo código` 
      };
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const cooldownExpiresAt = new Date(Date.now() + 60 * 1000);

    await this.usersRepository.setEmailCode(user.id, code, expiresAt, cooldownExpiresAt);

    const result = await sendVerificationEmail(user.email, code);
    if (!result.sent) {
      console.log(`Código de verificação para ${user.email}: ${code}`);
      console.warn(`Email não enviado: ${result.error}`);
    }

    return { success: true, message: "Código reenviado para seu email" };
  }
}
