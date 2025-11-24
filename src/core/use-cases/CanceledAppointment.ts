import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";

export class CanceledAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(clientId: string, appointmentId: string): Promise<void | Error> {
    const client = await this.clientRepository.findByUserId(clientId);
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (appointment.clientId !== client.id) {
      throw new NoAuthorizationError();
    }
    await this.appointmentRepository.canceled(appointmentId);
  }
}
