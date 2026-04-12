import { Response } from "express";
import { CreateManualAppointment } from "../../../../core/use-cases/CreateManualAppointment";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class CreateManualAppointmentController {
  constructor(private createManualAppointment: CreateManualAppointment) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const appointment = await this.createManualAppointment.execute({
      barberUserId: req.user.id,
      customerName: req.body.customerName,
      customerWhatsapp: req.body.customerWhatsapp,
      serviceId: req.body.serviceId,
      timeId: req.body.timeId,
    });

    return res.status(201).send(appointment);
  }
}
