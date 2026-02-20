import { Response } from "express";
import { PrismaBarberRepository } from "../../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class DeleteBarberController {
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const barberRepo = new PrismaBarberRepository();
    const id = req.params.id as string;
    
    const barber = await barberRepo.findByUserId(id);
    if (!barber) {
      return res.status(404).json({ message: "Barbeiro não encontrado" });
    }

    await barberRepo.dismiss(barber.id);
    return res.status(200).json({ message: "Barbeiro desativado com sucesso" });
  }
}
