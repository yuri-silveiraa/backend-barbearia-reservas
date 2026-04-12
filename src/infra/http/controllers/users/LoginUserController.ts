import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';
import { User } from '../../../../core/entities/User';
import { sign } from 'jsonwebtoken';
import { env } from '../../../../config/env';
import { AUTH_TOKEN_EXPIRES_IN, getAuthCookieOptions } from '../../helpers/authCookie';
import { prisma } from '../../../database/prisma/prismaClient';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}
  async handle(req: Request, res: Response) {
    const user = await this.authenticateUser.execute(req.body);
    
    if (!('id' in user)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = sign({ userId: user.id }, env.jwtSecret, { expiresIn: AUTH_TOKEN_EXPIRES_IN });

    res.cookie('token', token, getAuthCookieOptions(req));

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { barber: true }
    });

    const { password, ...userWithoutPassword } = user as User & { password: string };
    const responseUser = {
      ...userWithoutPassword,
      isAdmin: fullUser?.barber?.isAdmin ?? false
    };
    
    return res.status(200).json({ user: responseUser });
  }
}
