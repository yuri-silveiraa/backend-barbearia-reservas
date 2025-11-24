import { Request, Response } from 'express';
import { CreateUser } from '../../../../core/use-cases/CreateUser';

export class RegisterUserController {
  constructor(private createUser: CreateUser) {}

  async handle(req: Request, res: Response) {
    console.log("cheguei aqui")
    const user = await this.createUser.execute(req.body);
    const data = {
      name: user.name,
      email: user.email
    }
    return res.status(201).send(data);
  }
}
