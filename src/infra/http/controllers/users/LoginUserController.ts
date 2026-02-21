import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';
import { User } from '../../../../core/entities/User';
import { sign } from 'jsonwebtoken';
import { env } from '../../../../config/env';
import { getAuthCookieOptions } from '../../helpers/authCookie';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}
  async handle(req: Request, res: Response) {
    const user = await this.authenticateUser.execute(req.body);
    
    if (!('id' in user)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1d' });

    res.cookie('token', token, getAuthCookieOptions(req));

    const { password, ...userWithoutPassword } = user as User & { password: string };
    return res.status(200).json({ user: userWithoutPassword });
  }
}
