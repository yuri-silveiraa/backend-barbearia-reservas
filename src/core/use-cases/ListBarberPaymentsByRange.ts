import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IBalanceRepository } from "../repositories/IBalanceRepository";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

export class ListBarberPaymentsByRange {
  constructor(
    private barberRepository: IBarbersRepository,
    private balanceRepository: IBalanceRepository,
    private paymentRepository: IPaymentRepository,
    private appointmentRepository: IAppointmentsRepository,
  ) {}

  async execute(userId: string, startDate: Date, endDate: Date) {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new NoAuthorizationError();
    }

    const balance = await this.balanceRepository.findByBarberId(barber.id);
    const balanceValue = balance?.balance ?? 0;

    const payments = balance
      ? await this.paymentRepository.findByBalanceIdRange(balance.id, startDate, endDate)
      : [];

    const completedAppointments = await this.appointmentRepository.findCompletedByBarberIdRange(
      barber.id,
      startDate,
      endDate
    );

    const serviceMap = new Map<string, { serviceId: string; service: string; count: number; total: number }>();
    completedAppointments.forEach((item) => {
      const existing = serviceMap.get(item.serviceId) || {
        serviceId: item.serviceId,
        service: item.service,
        count: 0,
        total: 0,
      };
      existing.count += 1;
      existing.total += item.price;
      serviceMap.set(item.serviceId, existing);
    });

    const services = Array.from(serviceMap.values()).sort((a, b) => b.total - a.total);

    return { balance: balanceValue, payments, services };
  }
}
