import { Request, Response } from 'express';
import { loginSchema } from '../../schemas/userSchemas';
import { AuthenticateUser } from '../../../../core/use-cases/AuthenticateUser';

export class LoginUserController {
  constructor(private authenticateUser: AuthenticateUser) {}

  async handle(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });

    try {
      const token = await this.authenticateUser.execute(parsed.data);
      return res.json({ token });
    } catch (err) {
      return res.status(401).json({ message: (err as Error).message });
    }
  }
}