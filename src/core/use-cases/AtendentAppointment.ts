import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { AtendentAppointmentDTO } from "../dtos/AtendentAppointmentDTO";

export class AtendentAppointment {
  constructor(private appointmentRepository: IAppointmentsRepository) {}

  async execute(data: AtendentAppointmentDTO): Promise<void> {
    const appointments = await this.appointmentRepository.updateStatus(data.id, data.status);
  }
}