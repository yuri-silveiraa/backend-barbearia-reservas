export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";
export type AppointmentCanceledBy = "CLIENT" | "BARBER";

export class Appointment {
  constructor(
    public readonly id: string,
    public barberId: string,
    public serviceId: string,
    public customerId: string,
    public customerName: string,
    public customerWhatsapp: string,
    public barberName: string,
    public barberWhatsapp: string | null,
    public serviceName: string,
    public scheduledAt: Date,
    public scheduledEndAt: Date,
    public serviceDurationMinutes: number,
    public readonly clientId?: string | null,
    public price: number = 0,
    public status: AppointmentStatus = "SCHEDULED",
    public canceledBy?: AppointmentCanceledBy | null,
    public readonly createdAt: Date = new Date()
  ) {}
}
