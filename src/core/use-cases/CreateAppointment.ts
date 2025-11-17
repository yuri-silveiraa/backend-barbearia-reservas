import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
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
    const clientId = client.id;
    data.clientId = clientId;

    const appointment = await this.appointmentRepository.create(data);
    if (appointment) {
      await this.timeRepository.updateDisponible(data.timeId, false);
    }

    return appointment;
  }
}