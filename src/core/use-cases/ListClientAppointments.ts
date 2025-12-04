import { AppointmentDTO } from "../dtos/AppointmentDTO";
import { ClientNotFoundError } from "../errors/ClientNotFoundError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";

export class ListClientAppointments {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(id: string): Promise<AppointmentDTO[]> {
    const client = await this.clientRepository.findByUserId(id);
    if (!client) {
      throw new ClientNotFoundError();
    }
    const appointment = await this.appointmentsRepository.findByClientId(client.id);

    return appointment;
  }
}