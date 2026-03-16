import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { VerifyEmail } from "../../../../core/use-cases/VerifyEmail";
import { env } from "../../../../config/env";
import { getAuthCookieOptions } from "../../helpers/authCookie";
import { PrismaUsersRepository } from "../../../database/repositories/PrismaUsersRepository";

export class VerifyEmailController {
  constructor(private verifyEmail: VerifyEmail) {}

  async handle(req: Request, res: Response) {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Código é obrigatório" });
    }

    try {
      const result = await this.verifyEmail.execute({ code });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      const userId = result.userId;
      if (!userId) {
        return res.status(500).json({ message: "Erro ao verificar email" });
      }

      const token = sign({ userId }, env.jwtSecret, { expiresIn: "1d" });
      res.cookie("token", token, getAuthCookieOptions(req));

      const usersRepository = new PrismaUsersRepository();
      const fullUser = await usersRepository.getMe(userId);

      if (!fullUser) {
        return res.status(500).json({ message: "Erro ao carregar usuário" });
      }

      const { password, ...userWithoutPassword } = fullUser as { password?: string };
      const responseUser = {
        ...userWithoutPassword,
        isAdmin: fullUser.barber?.isAdmin ?? false,
      };

      return res.json({ message: result.message, user: responseUser });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao verificar email" });
    }
  }
}
