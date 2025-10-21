import { Appointment } from "../entities/Appointment";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";

export class ListAppointments {
  constructor(private appointmentsRepository: IAppointmentsRepository) {}

  async execute(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findById(id);
    if (!appointment) {
      throw new Error("Appointment not found.");
    }
    return appointment;
  }
}