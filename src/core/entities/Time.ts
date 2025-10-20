import { Appointment } from "./Appointment";

export class Time {
  constructor(
    public readonly id: string,
    public readonly barberId: string,
    public date: Date,
    public disponible: boolean = true,
    public readonly createdAt: Date = new Date(),
    public appointments: Appointment[] = []
  ) {}

  markUnavailable() {
    this.disponible = false;
  }

  markAvailable() {
    this.disponible = true;
  }

  isAvailable(): boolean {
    return this.disponible;
  }
}
