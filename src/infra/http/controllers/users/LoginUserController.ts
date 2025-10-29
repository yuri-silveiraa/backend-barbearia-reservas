import { Request, Response } from 'express';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';
import { sign } from 'jsonwebtoken';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}

  async handle(req: Request, res: Response) {
      const user = await this.authenticateUser.execute(req.body.email, req.body.password);
      const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token });
  }
}