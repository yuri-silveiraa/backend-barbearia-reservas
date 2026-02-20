import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IBalanceRepository } from "../repositories/IBalanceRepository";

export interface BarberDailyStats {
  completedCount: number;
  scheduledCount: number;
  totalRevenue: number;
}

export class GetBarberDailyStats {
  constructor(
    private appointmentsRepository: IAppointmentsRepository,
    private barberRepository: IBarbersRepository,
    private balanceRepository: IBalanceRepository,
  ) {}

  async execute(userId: string): Promise<BarberDailyStats> {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const today = new Date();
    const completedCount = await this.appointmentsRepository.countCompletedByBarberToday(barber.id, today);
    
    const balance = await this.balanceRepository.findByBarberId(barber.id);

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentsRepository.findByBarberIdToday(barber.id, startOfDay, endOfDay);
    const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;

    return {
      completedCount,
      scheduledCount,
      totalRevenue: balance?.balance || 0,
    };
  }
}
