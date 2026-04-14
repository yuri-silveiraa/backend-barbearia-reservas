import { Request, Response } from 'express';
import { AuthenticateWithGoogle, GoogleUserPayload } from '../../../../core/use-cases/AuthenticateWithGoogle';
import { PrismaUsersRepository } from '../../../database/repositories/PrismaUsersRepository';
import { User } from '../../../../core/entities/User';
import { sign } from 'jsonwebtoken';
import { env } from '../../../../config/env';
import { AUTH_TOKEN_EXPIRES_IN, getAuthCookieOptions } from '../../helpers/authCookie';
import { OAuth2Client } from 'google-auth-library';
import { toUserResponse } from '../../helpers/userResponse';

export class GoogleAuthController {
  private usersRepository: PrismaUsersRepository;
  private authenticateWithGoogle: AuthenticateWithGoogle;
  private client: OAuth2Client;

  constructor() {
    this.usersRepository = new PrismaUsersRepository();
    this.authenticateWithGoogle = new AuthenticateWithGoogle(this.usersRepository);
    this.client = new OAuth2Client(env.googleClientId);
  }

  async handle(req: Request, res: Response) {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Credential é obrigatória' });
    }

    try {
      if (!env.googleClientId) {
        return res.status(500).json({ message: 'Google client ID não configurado' });
      }

      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: env.googleClientId,
      });

      const googlePayload = ticket.getPayload();
      if (!googlePayload?.sub || !googlePayload.email || !googlePayload.name) {
        return res.status(400).json({ message: 'Token Google inválido' });
      }

      const payload: GoogleUserPayload = {
        sub: googlePayload.sub,
        email: googlePayload.email,
        name: googlePayload.name,
        picture: googlePayload.picture,
      };

      const user = await this.authenticateWithGoogle.execute(payload);

      const token = sign({ userId: user.id }, env.jwtSecret, { expiresIn: AUTH_TOKEN_EXPIRES_IN });

      res.cookie('token', token, getAuthCookieOptions(req));

      const userWithoutPassword = toUserResponse(user as User);
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Erro na autenticação Google:', error);
      return res.status(500).json({ message: 'Erro ao autenticar com Google' });
    }
  }
}
