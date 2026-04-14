import { Time } from "../../core/entities/Time";
import { CreateTimeRepositoryDTO, ITimeRepository } from "../../core/repositories/ITimeRepository";

export class FakeTimeRepository implements ITimeRepository {
  private times: Time[] = [];

  async create(data: CreateTimeRepositoryDTO): Promise<Time> {
    const time: Time = {
      id: String(this.times.length + 1),
      date: data.date,
      barberId: data.barberId,
      disponible: true,
      duration: data.duration ?? 60,
    };
    this.times.push(time);
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = this.times.filter(t => t.barberId === barberId && new Date(t.date) >= now);
    return times.length > 0 ? times : null;
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]> {
    return this.times.filter((time) =>
      time.barberId === barberId &&
      new Date(time.date).getTime() >= startDate.getTime() &&
      new Date(time.date).getTime() < endDate.getTime()
    );
  }

  async findAvailableByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = this.times.filter(t => t.barberId === barberId && t.disponible && new Date(t.date) >= now);
    return times.length > 0 ? times : null;
  }

  async findById(timeId: string): Promise<Time | null> {
    const time = this.times.find(t => t.id === timeId);
    return time || null;
  }

  async updateDisponible(timeId: string, disponible: boolean): Promise<void> {
    const time = this.times.find(t => t.id === timeId);
    if (time) {
      time.disponible = disponible;
    }
  }

  async deleteById(timeId: string): Promise<void> {
    const index = this.times.findIndex(t => t.id === timeId);
    if (index !== -1) {
      this.times.splice(index, 1);
    }
  }
}
