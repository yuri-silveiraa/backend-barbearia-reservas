import { ListClientAppointments } from "../../../../core/use-cases/ListClientAppointments";
import { Response } from "express";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListClientAppointmentsController {
  constructor(private listClientAppointments: ListClientAppointments) {}

  async handle(req: AuthenticatedRequest, res: Response){
    const { id } = req.user;

    const appointments = await this.listClientAppointments.execute(id);

    return res.status(200).json(appointments);
  }
}