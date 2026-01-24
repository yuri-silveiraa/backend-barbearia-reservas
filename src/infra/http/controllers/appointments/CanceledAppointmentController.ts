import { Response } from "express";
import { CanceledAppointment } from "../../../../core/use-cases/CanceledAppointment";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class CanceledAppointmentController {
  constructor(
    private canceledAppointment: CanceledAppointment
  ) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const clientId = req.user.id;
    const appointmentId = req.params.id as string;
    await this.canceledAppointment.execute(clientId, appointmentId);
    return res.status(200).send("Cancelado com sucesso!");
  }
}