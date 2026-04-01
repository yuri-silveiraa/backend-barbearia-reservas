import { AppointmentDTO } from "../dtos/AppointmentDTO";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";

export class ListBarberAppointmentsByRange {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(userId: string, start: Date, end: Date): Promise<AppointmentDTO[]> {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    return this.appointmentsRepository.findByBarberIdRange(barber.id, start, end);
  }
}
