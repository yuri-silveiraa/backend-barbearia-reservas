import { Response } from "express";
import { AttendAppointment } from "../../../../core/use-cases/AttendAppointment";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class AttendAppointmentController {
  constructor(private attendAppointment: AttendAppointment) {}
  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    await this.attendAppointment.execute({ id: req.params.id, status: req.body.status, userId: req.user.id });

    return res.status(200).send("Reserva atendida com sucesso");
  }
}
