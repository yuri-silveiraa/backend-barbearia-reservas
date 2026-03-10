import { Request, Response } from "express";
import { ListAvailableTimeSlots } from "../../../../core/use-cases/ListAvailableTimeSlots";

export class ListAvailableTimeSlotsController {
  constructor(private listAvailableTimeSlots: ListAvailableTimeSlots) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const barberId = req.query.barberId as string || req.params.barberId as string;

      if (!barberId) {
        return res.status(400).json({ message: "ID do barbeiro é obrigatório" });
      }

      const timeSlots = await this.listAvailableTimeSlots.execute(barberId);

      return res.status(200).json(timeSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar horários";
      return res.status(400).json({ message });
    }
  }
}
