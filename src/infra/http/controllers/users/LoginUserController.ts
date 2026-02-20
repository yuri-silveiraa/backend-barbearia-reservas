import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';
import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}
  async handle(req: Request, res: Response) {
    const user = await this.authenticateUser.execute(req.body) as User;
    const token = sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
    return res.status(200).json({ token: token, user: user });
  }
}