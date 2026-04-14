import { AppError } from "../errors/AppError";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class CanceledAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(clientId: string, appointmentId: string): Promise<void | Error> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    const client = await this.clientRepository.findByUserId(clientId);
    if (client) {
      if (appointment.clientId !== client.id) {
        throw new NoAuthorizationError();
      }
    } else {
      const barber = await this.barberRepository.findByUserId(clientId);
      if (!barber || appointment.barberId !== barber.id) {
        throw new NoAuthorizationError();
      }
    }

    if (appointment.status === "COMPLETED") {
      throw new AppError("Agendamentos concluídos não podem ser cancelados", 400);
    }

    if (appointment.status === "CANCELED") {
      return;
    }

    await this.appointmentRepository.canceled(appointmentId);
    if (appointment.timeId) {
      await this.timeRepository.updateDisponible(appointment.timeId, true);
    }
  }
}
