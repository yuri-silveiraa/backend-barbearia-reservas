import { Appointment } from "./Appointment";
import { Balance } from "./Balance";
import { Time } from "./Time";

export class Barber {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public isAdmin: boolean = false,
    public readonly createdAt: Date = new Date(),
    public appointments: Appointment[] = [],
    public balance?: Balance,
    public times: Time[] = []
  ) {}
}
