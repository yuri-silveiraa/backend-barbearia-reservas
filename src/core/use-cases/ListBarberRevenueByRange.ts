import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

export class ListBarberRevenueByRange {
  constructor(
    private barberRepository: IBarbersRepository,
    private appointmentRepository: IAppointmentsRepository,
  ) {}

  async execute(userId: string, startDate: Date, endDate: Date, serviceId?: string) {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new NoAuthorizationError();
    }

    const completedAppointments = await this.appointmentRepository.findCompletedByBarberIdRange(
      barber.id,
      startDate,
      endDate,
      serviceId
    );

    const totalRevenue = completedAppointments.reduce((total, item) => total + item.price, 0);
    const appointments = completedAppointments.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      service: item.service,
      amount: item.price,
      completedAt: item.time,
    }));

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

    return { totalRevenue, appointments, services };
  }
}
