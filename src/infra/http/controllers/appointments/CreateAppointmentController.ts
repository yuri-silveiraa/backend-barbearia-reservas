import { CreateAppointment } from "../../../../core/use-cases/CreateAppointment";
import { Response } from 'express';
import { AuthenticatedRequest } from "../../middlewares/ensureAuthenticated";

export class CreateAppointmentController {
  constructor(
    private createAppointment: CreateAppointment,
  ) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const appointment = await this.createAppointment.execute({
      barberId: req.body.barberId,
      clientId: userId,
      serviceId: req.body.serviceId,
      timeId: req.body.timeId
    });

    return res.status(201).send(appointment);
  }
}
