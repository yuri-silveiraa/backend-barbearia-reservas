import { Response } from "express";
import { z } from "zod";
import { ListBarberAppointmentsByRange } from "../../../../core/use-cases/ListBarberAppointmentsByRange";
import { businessDayBoundary } from "../../../../core/utils/businessDate";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

const QuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  serviceId: z.string().uuid().optional(),
});

export class ListBarberAppointmentsByRangeController {
  constructor(private listBarberAppointmentsByRange: ListBarberAppointmentsByRange) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const query = QuerySchema.safeParse(req.query);
      if (!query.success) {
        return res.status(400).json({ message: "Período inválido" });
      }

      const { start, end, serviceId } = query.data;
      const startDate = businessDayBoundary(start, "start");
      const endDate = businessDayBoundary(end, "end");
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Período inválido" });
      }

      if (startDate > endDate) {
        return res.status(400).json({ message: "Data inicial maior que data final" });
      }

      const appointments = await this.listBarberAppointmentsByRange.execute(
        req.user.id,
        startDate,
        endDate,
        serviceId
      );

      return res.status(200).json(appointments);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar agendamentos";
      return res.status(400).json({ message });
    }
  }
}
