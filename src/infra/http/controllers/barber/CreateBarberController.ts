import { Request, Response } from "express";
import { CreateBarber } from "../../../../core/use-cases/CreateBarber";
import { z } from "zod";

const CreateBarberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  isAdmin: z.boolean().optional().default(false),
});

export class CreateBarberController {
  constructor(private createBarber: CreateBarber) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const data = CreateBarberSchema.parse(req.body);
    const user = await this.createBarber.execute({
      name: data.name,
      email: data.email,
      password: data.password,
      type: "BARBER",
    }, data.isAdmin || false);
    
    const { password, ...userWithoutPassword } = user;
    return res.status(201).json({ user: userWithoutPassword });
  }
}
