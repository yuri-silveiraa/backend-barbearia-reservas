import { AppointmentDTO } from "../../core/dtos/AppointmentDTO";
import { Appointment } from "../../core/entities/Appointment";
import { IAppointmentsRepository } from "../../core/repositories/IAppointmentRepository";

export class FakeAppointmentRepository implements IAppointmentsRepository {
  private appointments: Appointment[] = [];

  async create(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment> {
    const appointment: Appointment = {
      id: String(this.appointments.length + 1),
      barberId: data.barberId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      timeId: data.timeId,
      status: "SCHEDULED",
      createdAt: new Date(),
    };
    this.appointments.push(appointment);
    return appointment;
  }

  async findByClientId(id: string): Promise<AppointmentDTO[] | null> {
    const appointments = this.appointments.filter(a => a.clientId === id);
    return appointments.map(a => this.toDTO(a));
  }

  async findById(id: string): Promise<AppointmentDTO | null> {
    const appointment = this.appointments.find(a => a.id === id);
    return appointment ? this.toDTO(appointment) : null;
  }

  async findByBarberIdToday(barberId: string, startDate: Date, endDate: Date): Promise<AppointmentDTO[]> {
    const appointments = this.appointments.filter(
      a => a.barberId === barberId
    );
    return appointments.map(a => this.toDTO(a));
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
           a.createdAt >= startOfDay && 
           a.createdAt <= endOfDay
    ).length;
  }

  async attend(id: string): Promise<void> {
    const appointment = this.appointments.find(a => a.id === id);
    if (appointment) {
      appointment.status = "COMPLETED";
    }
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
      barberId: appointment.barberId,
      serviceId: appointment.serviceId,
      client: "Client Name",
      barber: "Barber Name",
      service: "Service Name",
      time: new Date(),
      status: appointment.status,
    };
  }
}
