import { Request, Response } from "express";
import { GenerateTimeSlots } from "../../../../core/use-cases/GenerateTimeSlots";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class GenerateTimeSlotsController {
  constructor(private generateTimeSlots: GenerateTimeSlots) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const barberUserId = req.user?.id;
      
      if (!barberUserId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const { timeSlots, validation } = await this.generateTimeSlots.execute(
        barberUserId,
        req.body
      );

      return res.status(201).json({
        timeSlots,
        validation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar horários";
      return res.status(400).json({ message });
    }
  }
}
