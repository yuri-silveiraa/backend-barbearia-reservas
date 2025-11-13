import { ListClientAppointments } from "../../../../core/use-cases/ListClientAppointments";
import { AuthenticatedRequest } from "../../middlewares/ensureAuthenticated";
import { Response } from "express";

export class ListClientAppointmentsController {
  constructor(private listClientAppointments: ListClientAppointments) {}

  async handle(req: AuthenticatedRequest, res: Response){
    const { id } = req.user;

    const appointments = await this.listClientAppointments.execute(id);

    return res.status(200).json(appointments);
  }
}