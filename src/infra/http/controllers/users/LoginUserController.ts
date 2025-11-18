import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';
import { sign } from 'jsonwebtoken';
import { User } from '@prisma/client';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}

  async handle(req: Request, res: Response) {
      const user = await this.authenticateUser.execute(req.body) as User;
      console.log("user no controller", user.id);
      const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({ token });
  }
}