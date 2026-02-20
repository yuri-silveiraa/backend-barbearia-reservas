import { Response } from "express";
import { ListBarberTodayAppointments } from "../../../../core/use-cases/ListBarberTodayAppointments";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListBarberTodayAppointmentsController {
  constructor(private listBarberTodayAppointments: ListBarberTodayAppointments) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const appointments = await this.listBarberTodayAppointments.execute(req.user.id);
    return res.status(200).json(appointments);
  }
}
