import { Response } from "express";
import { AtendentAppointment } from "../../../../core/use-cases/AtendentAppointment";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class AtendentAppointmentController {
  constructor(private atendentAppointment: AtendentAppointment) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    await this.atendentAppointment.execute({ id: req.params.id, status: req.body.status, userId: req.user.id });

    return res.status(200).send("Reserva atendida com sucesso");
  }
}
