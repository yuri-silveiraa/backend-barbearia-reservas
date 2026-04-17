import { AppError } from "../errors/AppError";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";

export class CanceledAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(clientId: string, appointmentId: string): Promise<void | Error> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    const client = await this.clientRepository.findByUserId(clientId);
    let canceledBy: "CLIENT" | "BARBER" = "CLIENT";
    if (client) {
      if (appointment.clientId !== client.id) {
        throw new NoAuthorizationError();
      }
    } else {
      const barber = await this.barberRepository.findByUserId(clientId);
      if (!barber || appointment.barberId !== barber.id) {
        throw new NoAuthorizationError();
      }
      canceledBy = "BARBER";
    }

    if (appointment.status === "COMPLETED") {
      throw new AppError("Agendamentos concluídos não podem ser cancelados", 400);
    }

    if (appointment.status === "CANCELED") {
      return;
    }

    await this.appointmentRepository.canceled(appointmentId, canceledBy);
  }
}
