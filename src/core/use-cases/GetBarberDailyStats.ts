import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { todayBusinessDayRange } from "../utils/businessDate";

export interface BarberDailyStats {
  completedCount: number;
  scheduledCount: number;
  totalRevenue: number;
}

export class GetBarberDailyStats {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(userId: string): Promise<BarberDailyStats> {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const { start, end } = todayBusinessDayRange();

    const appointments = await this.appointmentsRepository.findByBarberIdToday(barber.id, start, end);
    const completedAppointments = await this.appointmentsRepository.findCompletedByBarberIdRange(
      barber.id,
      start,
      end
    );

    return {
      completedCount: completedAppointments.length,
      scheduledCount: appointments.filter((appointment) => appointment.status === "SCHEDULED").length,
      totalRevenue: completedAppointments.reduce((total, appointment) => total + appointment.price, 0),
    };
  }
}
