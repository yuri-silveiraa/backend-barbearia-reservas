import { AppointmentDTO } from "../dtos/AppointmentDTO";
import { todayBusinessDayRange } from "../utils/businessDate";
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

    const { start, end } = todayBusinessDayRange();

    return this.appointmentsRepository.findByBarberIdToday(barber.id, start, end);
  }
}
