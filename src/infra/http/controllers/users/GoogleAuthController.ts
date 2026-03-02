import { Request, Response } from 'express';
import { AuthenticateWithGoogle, GoogleUserPayload } from '../../../../core/use-cases/AuthenticateWithGoogle';
import { PrismaUsersRepository } from '../../../database/repositories/PrismaUsersRepository';
import { User } from '../../../../core/entities/User';
import { sign } from 'jsonwebtoken';
import { env } from '../../../../config/env';
import { getAuthCookieOptions } from '../../helpers/authCookie';
import jwt from 'jsonwebtoken';

export class GoogleAuthController {
  private usersRepository: PrismaUsersRepository;
  private authenticateWithGoogle: AuthenticateWithGoogle;

  constructor() {
    this.usersRepository = new PrismaUsersRepository();
    this.authenticateWithGoogle = new AuthenticateWithGoogle(this.usersRepository);
  }

  async handle(req: Request, res: Response) {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential é obrigatória' });
    }

    try {
      const decoded = jwt.decode(credential);
      
      if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
        return res.status(400).json({ message: 'Token Google inválido' });
      }

      const payload: GoogleUserPayload = {
        sub: decoded.sub as string,
        email: decoded.email as string,
        name: decoded.name as string,
        picture: decoded.picture as string | undefined,
      };

      const user = await this.authenticateWithGoogle.execute(payload);

      const token = sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1d' });

      res.cookie('token', token, getAuthCookieOptions(req));

      const { password, ...userWithoutPassword } = user as User & { password: string };
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Erro na autenticação Google:', error);
      return res.status(500).json({ message: 'Erro ao autenticar com Google' });
    }
  }
}
