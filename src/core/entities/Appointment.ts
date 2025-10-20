export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export class Appointment {
  constructor(
    public readonly id: string,
    public barberId: string,
    public readonly clientId: string,
    public serviceId: string,
    public timeId: string,
    public status: AppointmentStatus = "SCHEDULED",
    public readonly createdAt: Date = new Date()
  ) {}

  complete() {
    this.status = "COMPLETED";
  }

  cancel() {
    this.status = "CANCELED";
  }

  isActive(): boolean {
    return this.status === "SCHEDULED";
  }
}
