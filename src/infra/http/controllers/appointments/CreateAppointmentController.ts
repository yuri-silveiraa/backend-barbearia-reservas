import { CreateAppointment } from "../../../../core/use-cases/CreateAppointment";
import { Response } from 'express';
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class CreateAppointmentController {
  constructor(
    private createAppointment: CreateAppointment,
  ) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const serviceIds = req.body.serviceIds;
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "Pelo menos um serviço deve ser selecionado" });
    }

    const appointment = await this.createAppointment.execute({
      barberId: req.body.barberId,
      clientId: userId,
      serviceIds: serviceIds,
      startAt: req.body.startAt,
    });

    return res.status(201).send(appointment);
  }
}
