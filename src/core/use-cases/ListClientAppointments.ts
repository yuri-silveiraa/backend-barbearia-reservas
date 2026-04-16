import { ClientNotFoundError } from "../errors/ClientNotFoundError";
import { IAppointmentsRepository, PaginatedAppointments } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";

export class ListClientAppointments {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(id: string, page = 1, limit = 10): Promise<PaginatedAppointments> {
    const client = await this.clientRepository.findByUserId(id);
    if (!client) {
      throw new ClientNotFoundError();
    }
    const appointment = await this.appointmentsRepository.findByClientId(client.id, page, limit);

    return appointment;
  }
}