import { Response } from "express";
import { ToggleTimeSlot } from "../../../../core/use-cases/ToggleTimeSlot";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ToggleTimeSlotController {
  constructor(private toggleTimeSlot: ToggleTimeSlot) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const barberUserId = req.user?.id;
      const timeSlotId = req.params.id as string;
      
      if (!barberUserId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      if (!timeSlotId) {
        return res.status(400).json({ message: "ID do horário é obrigatório" });
      }

      const timeSlot = await this.toggleTimeSlot.execute(barberUserId, timeSlotId);

      return res.status(200).json(timeSlot);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao alterar disponibilidade";
      const statusCode = error instanceof Error && message.includes("permissão") ? 403 : 400;
      return res.status(statusCode).json({ message });
    }
  }
}
