import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { ClientScheduleLimitError } from "../errors/ClientScheduleLimitError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";


export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
    private timeRepository: ITimeRepository
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

    const appointment = await this.appointmentRepository.create(data);
    if (appointment) {
      await this.timeRepository.updateDisponible(data.timeId, false);
    }

    return appointment;
  }
}