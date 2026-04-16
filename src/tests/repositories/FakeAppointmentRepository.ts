import { AppointmentDTO } from "../../core/dtos/AppointmentDTO";
import { Appointment } from "../../core/entities/Appointment";
import { CreateAppointmentRepositoryDTO, IAppointmentsRepository } from "../../core/repositories/IAppointmentRepository";

export class FakeAppointmentRepository implements IAppointmentsRepository {
  private appointments: Appointment[] = [];

  async create(data: CreateAppointmentRepositoryDTO | (Omit<CreateAppointmentRepositoryDTO, "startAt"> & { timeId?: string; startAt?: Date })): Promise<Appointment> {
    const scheduledAt = data.startAt ?? new Date("2030-04-10T10:00:00.000Z");
    const serviceDurationMinutes = 30;
    const appointment: Appointment = {
      id: String(this.appointments.length + 1),
      barberId: data.barberId,
      clientId: data.clientId ?? null,
      customerId: data.customerId ?? data.clientId ?? String(this.appointments.length + 1),
      customerName: "Client Name",
      customerWhatsapp: "11912345678",
      barberName: "Barber Name",
      barberWhatsapp: "11999999999",
      serviceId: data.serviceId,
      serviceName: "Service Name",
      scheduledAt,
      scheduledEndAt: new Date(scheduledAt.getTime() + serviceDurationMinutes * 60 * 1000),
      serviceDurationMinutes,
      price: data.price ?? 0,
      status: "SCHEDULED",
      createdAt: new Date(),
    };
    this.appointments.push(appointment);
    return appointment;
  }

  async findByClientId(id: string): Promise<AppointmentDTO[] | null> {
    return this.appointments.filter(a => a.clientId === id).map(a => this.toDTO(a));
  }

  async findByCustomerId(id: string): Promise<AppointmentDTO[] | null> {
    return this.appointments.filter(a => a.customerId === id).map(a => this.toDTO(a));
  }

  async findById(id: string): Promise<AppointmentDTO | null> {
    const appointment = this.appointments.find(a => a.id === id);
    return appointment ? this.toDTO(appointment) : null;
  }

  async findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    return this.appointments
      .filter(a => a.barberId === barberId && a.scheduledAt >= startDate && a.scheduledAt < endDate)
      .map(a => this.toDTO(a));
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date, serviceId?: string): Promise<AppointmentDTO[]> {
    return this.appointments
      .filter(a =>
        a.barberId === barberId &&
        a.scheduledAt >= startDate &&
        a.scheduledAt <= endDate &&
        (!serviceId || a.serviceId === serviceId)
      )
      .map(a => this.toDTO(a));
  }

  async findScheduledByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    return this.appointments
      .filter(a =>
        a.barberId === barberId &&
        a.status === "SCHEDULED" &&
        a.scheduledAt < endDate &&
        a.scheduledEndAt > startDate
      )
      .map(a => this.toDTO(a));
  }

  async findCompletedByBarberIdRange(barberId: string, startDate: Date, endDate: Date, serviceId?: string) {
    return this.appointments
      .filter(a =>
        a.barberId === barberId &&
        a.status === "COMPLETED" &&
        a.scheduledAt >= startDate &&
        a.scheduledAt <= endDate &&
        (!serviceId || a.serviceId === serviceId)
      )
      .map(a => ({
        id: a.id,
        serviceId: a.serviceId,
        service: a.serviceName,
        price: a.price,
        time: a.scheduledAt,
      }));
  }

  async countByClientSince(clientId: string, since: Date): Promise<number> {
    return this.appointments.filter(
      a => a.clientId === clientId && a.createdAt >= since && a.status === "SCHEDULED"
    ).length;
  }

  async countCompletedByBarberToday(barberId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.appointments.filter(
      a => a.barberId === barberId &&
           a.status === "COMPLETED" &&
           a.scheduledAt >= startOfDay &&
           a.scheduledAt <= endOfDay
    ).length;
  }

  async attend(id: string): Promise<boolean> {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment && appointment.status === "SCHEDULED") {
      appointment.status = "COMPLETED";
      return true;
    }
    return false;
  }

  async canceled(id: string): Promise<void> {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.status = "CANCELED";
    }
  }

  private toDTO(appointment: Appointment): AppointmentDTO {
    return {
      id: appointment.id,
      clientId: appointment.clientId,
      customerId: appointment.customerId,
      barberId: appointment.barberId,
      serviceId: appointment.serviceId,
      client: appointment.customerName,
      clientTelephone: appointment.customerWhatsapp,
      barber: appointment.barberName,
      barberTelephone: appointment.barberWhatsapp,
      service: appointment.serviceName,
      time: appointment.scheduledAt,
      endTime: appointment.scheduledEndAt,
      serviceDurationMinutes: appointment.serviceDurationMinutes,
      price: appointment.price,
      status: appointment.status,
    };
  }
}
