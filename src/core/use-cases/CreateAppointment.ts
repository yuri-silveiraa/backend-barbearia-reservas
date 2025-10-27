import { CreateAppointmentDTO } from "../dtos/CreateAppointmentDTO";
import { Appointment } from "../entities/Appointment";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";

export class CreateAppointment {
  constructor(private appointmentRepository: IAppointmentsRepository) {}

  async execute(data: CreateAppointmentDTO): Promise<Appointment> {
    const appointment = await this.appointmentRepository.create(data);
    return appointment;
  }
}