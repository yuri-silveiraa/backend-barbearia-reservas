import { Response } from "express";
import { ListBarberAppointmentsByRange } from "../../../../core/use-cases/ListBarberAppointmentsByRange";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListBarberAppointmentsByRangeController {
  constructor(private listBarberAppointmentsByRange: ListBarberAppointmentsByRange) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { start, end } = req.query;
      if (!start || !end || typeof start !== "string" || typeof end !== "string") {
        return res.status(400).json({ message: "Período inválido" });
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Período inválido" });
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const appointments = await this.listBarberAppointmentsByRange.execute(
        req.user.id,
        startDate,
        endDate
      );

      return res.status(200).json(appointments);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar agendamentos";
      return res.status(400).json({ message });
    }
  }
}
