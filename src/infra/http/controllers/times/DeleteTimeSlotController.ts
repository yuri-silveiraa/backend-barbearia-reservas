import { Response } from "express";
import { DeleteTimeSlot } from "../../../../core/use-cases/DeleteTimeSlot";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class DeleteTimeSlotController {
  constructor(private deleteTimeSlot: DeleteTimeSlot) {}

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

      await this.deleteTimeSlot.execute(barberUserId, timeSlotId);

      return res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir horário";
      const statusCode = error instanceof Error && message.includes("permissão") ? 403 : 400;
      return res.status(statusCode).json({ message });
    }
  }
}
