import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { AtendentAppointmentDTO } from "../dtos/AtendentAppointmentDTO";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

export class AtendentAppointment {
  constructor(
    private appointmentRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository
  ) {}

  async execute(data: AtendentAppointmentDTO): Promise<void> {
    const barber = await this.barberRepository.findByUserId(data.userId);
    if (!barber) {
      throw new NoAuthorizationError();
    }

    await this.appointmentRepository.updateStatus(data.id, data.status);
  }
}