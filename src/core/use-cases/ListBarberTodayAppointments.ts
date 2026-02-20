import { AppointmentDTO } from "../dtos/AppointmentDTO";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";

export class ListBarberTodayAppointments {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(userId: string): Promise<AppointmentDTO[]> {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.appointmentsRepository.findByBarberIdToday(barber.id, today, tomorrow);
  }
}
