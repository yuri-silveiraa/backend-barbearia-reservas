import { Time } from "../../core/entities/Time";
import { ITimeRepository } from "../../core/repositories/ITimeRepository";

export class FakeTimeRepository implements ITimeRepository {
  private times: Time[] = [];

  async create(data: Omit<Time, "id" | "disponible">): Promise<Time> {
    const time: Time = {
      id: String(this.times.length + 1),
      date: data.date,
      barberId: data.barberId,
      disponible: true,
    };
    this.times.push(time);
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const times = this.times.filter(t => t.barberId === barberId && t.disponible);
    return times.length > 0 ? times : null;
  }

  async updateDisponible(timeId: string, disponible: boolean): Promise<void> {
    const time = this.times.find(t => t.id === timeId);
    if (time) {
      time.disponible = disponible;
    }
  }
}
