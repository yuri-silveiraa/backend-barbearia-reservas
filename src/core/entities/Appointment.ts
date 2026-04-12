export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export class Appointment {
  constructor(
    public readonly id: string,
    public barberId: string,
    public serviceId: string,
    public timeId: string,
    public customerId: string,
    public customerName: string,
    public customerWhatsapp: string,
    public barberName: string,
    public serviceName: string,
    public scheduledAt: Date,
    public readonly clientId?: string | null,
    public price: number = 0,
    public status: AppointmentStatus = "SCHEDULED",
    public readonly createdAt: Date = new Date()
  ) {}
}
