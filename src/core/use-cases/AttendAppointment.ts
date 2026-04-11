import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { AttendAppointmentDTO } from "../dtos/AttendAppointmentDTO";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";
import { AppError } from "../errors/AppError";

export class AttendAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(data: AttendAppointmentDTO): Promise<void> {
    const barber = await this.barberRepository.findByUserId(data.userId);
    if (!barber) {
      throw new NoAuthorizationError();
    }

    const appointment = await this.appointmentRepository.findById(data.id);
    if (!appointment) {
      throw new AppError("Agendamento não encontrado", 404);
    }

    if (barber.id !== appointment.barberId) {
      throw new NoAuthorizationError();
    }

    if (appointment.status !== "SCHEDULED") {
      throw new AppError("Somente agendamentos marcados podem ser atendidos", 400);
    }

    const attended = await this.appointmentRepository.attend(data.id);
    if (!attended) {
      throw new AppError("Somente agendamentos marcados podem ser atendidos", 400);
    }
  }
}
