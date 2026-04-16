import { Request, Response } from "express";
import { ListAvailableTimeSlots } from "../../../../core/use-cases/ListAvailableTimeSlots";

export class ListAvailableTimeSlotsController {
  constructor(private listAvailableTimeSlots: ListAvailableTimeSlots) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const barberId = req.query.barberId as string || req.params.barberId as string;
      const serviceIdsParam = req.query.serviceIds as string | string[] | undefined;

      if (!barberId) {
        return res.status(400).json({ message: "ID do barbeiro é obrigatório" });
      }

      let serviceIds: string[] = [];
      if (Array.isArray(serviceIdsParam)) {
        serviceIds = serviceIdsParam;
      } else if (typeof serviceIdsParam === "string" && serviceIdsParam) {
        serviceIds = serviceIdsParam.split(",").map(s => s.trim()).filter(Boolean);
      }

      if (serviceIds.length === 0) {
        return res.status(400).json({ message: "Pelo menos um ID de serviço é obrigatório" });
      }

      const timeSlots = await this.listAvailableTimeSlots.execute({
        barberId,
        serviceIds,
        startDate: typeof req.query.startDate === "string" ? req.query.startDate : undefined,
        endDate: typeof req.query.endDate === "string" ? req.query.endDate : undefined,
      });

      return res.status(200).json(timeSlots);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar horários";
      return res.status(400).json({ message });
    }
  }
}
