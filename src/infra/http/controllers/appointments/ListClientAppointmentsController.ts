import { ListClientAppointments } from "../../../../core/use-cases/ListClientAppointments";
import { Response } from "express";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListClientAppointmentsController {
  constructor(private listClientAppointments: ListClientAppointments) {}

  async handle(req: AuthenticatedRequest, res: Response){
    const { id } = req.user;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const appointments = await this.listClientAppointments.execute(id, page, limit);

    return res.status(200).json(appointments);
  }
}