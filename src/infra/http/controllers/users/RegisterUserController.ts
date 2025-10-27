import { Request, Response } from 'express';
import { CreateUser } from '../../../../core/use-cases/CreateUser';

export class RegisterUserController {
  constructor(private createUser: CreateUser) {}

  async handle(req: Request, res: Response) {
    const user = await this.createUser.execute(req.body);
    return res.status(201).send(user);
  }
}
