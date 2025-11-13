import { Appointment } from "../entities/Appointment";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";

export class ListClientAppointments {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(id: string): Promise<Appointment[]> {
    const client = await this.clientRepository.findByUserId(id);
    const appointment = await this.appointmentsRepository.findByClientId(client.id);

    return appointment;
  }
}