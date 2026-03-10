import { Response } from "express";
import { ListMyTimeSlots } from "../../../../core/use-cases/ListMyTimeSlots";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListMyTimeSlotsController {
  constructor(private listMyTimeSlots: ListMyTimeSlots) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const barberUserId = req.user?.id;
      
      if (!barberUserId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const timeSlots = await this.listMyTimeSlots.execute(barberUserId);

      return res.status(200).json(timeSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar horários";
      return res.status(400).json({ message });
    }
  }
}
