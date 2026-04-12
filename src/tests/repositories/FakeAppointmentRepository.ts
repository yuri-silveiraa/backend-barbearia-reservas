import { AppointmentDTO } from "../../core/dtos/AppointmentDTO";
import { Appointment } from "../../core/entities/Appointment";
import { CreateAppointmentRepositoryDTO, IAppointmentsRepository } from "../../core/repositories/IAppointmentRepository";

export class FakeAppointmentRepository implements IAppointmentsRepository {
  private appointments: Appointment[] = [];

  async create(data: CreateAppointmentRepositoryDTO): Promise<Appointment> {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const appointment: Appointment = {
      id: String(this.appointments.length + 1),
      barberId: data.barberId,
      clientId: data.clientId ?? null,
      customerId: data.customerId ?? data.clientId ?? String(this.appointments.length + 1),
      customerName: "Client Name",
      customerWhatsapp: "11912345678",
      barberName: "Barber Name",
      serviceId: data.serviceId,
      serviceName: "Service Name",
      timeId: data.timeId,
      scheduledAt,
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
    return this.appointments.filter(a => a.barberId === barberId).map(a => this.toDTO(a));
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    return this.appointments.filter(a => a.barberId === barberId).map(a => this.toDTO(a));
  }

  async findCompletedByBarberIdRange(barberId: string, startDate: Date, endDate: Date) {
    return this.appointments
      .filter(a => a.barberId === barberId && a.status === "COMPLETED")
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
      timeId: appointment.timeId,
      client: appointment.customerName,
      clientTelephone: appointment.customerWhatsapp,
      barber: appointment.barberName,
      service: appointment.serviceName,
      time: appointment.scheduledAt,
      price: appointment.price,
      status: appointment.status,
    };
  }
}
