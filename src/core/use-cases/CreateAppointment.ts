import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { ClientScheduleLimitError } from "../errors/ClientScheduleLimitError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";


export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const client = await this.clientRepository.findByUserId(data.clientId);
    data.clientId = client.id;

    const dateNow = new Date();
    dateNow.setDate(dateNow.getDate() - 7);
    const createdAt = await this.appointmentRepository.countByClientSince(
      data.clientId,
      dateNow
    );
    if (createdAt >= 1) {
      throw new ClientScheduleLimitError();
    }

    return await this.appointmentRepository.create(data);
  }
}
