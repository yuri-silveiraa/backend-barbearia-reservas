import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IClientsRepository } from "../repositories/IClientRepository";


export class CreateAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private clientRepository: IClientsRepository,
  ) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const client = await this.clientRepository.findByUserId(data.clientId);
    const clientId = client.id;
    data.clientId = clientId;

    const appointment = await this.appointmentRepository.create(data);
    return appointment;
  }
}