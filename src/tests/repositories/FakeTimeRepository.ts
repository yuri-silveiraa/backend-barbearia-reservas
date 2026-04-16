import { Time } from "../../core/entities/Time";
import { CreateTimeRepositoryDTO, ITimeRepository } from "../../core/repositories/ITimeRepository";

export class FakeTimeRepository implements ITimeRepository {
  private times: Time[] = [];

  async create(data: CreateTimeRepositoryDTO | { barberId: string; date: Date; duration?: number }): Promise<Time> {
    const startAt = "startAt" in data ? data.startAt : data.date;
    const endAt = "endAt" in data ? data.endAt : new Date(startAt.getTime() + (data.duration ?? 60) * 60 * 1000);
    const time: Time = {
      id: String(this.times.length + 1),
      barberId: data.barberId,
      startAt,
      endAt,
      breakStartAt: "breakStartAt" in data ? data.breakStartAt ?? null : null,
      breakEndAt: "breakEndAt" in data ? data.breakEndAt ?? null : null,
      disponible: true,
      date: startAt,
      duration: Math.round((endAt.getTime() - startAt.getTime()) / 60000),
    } as Time & { disponible: boolean; date: Date; duration: number };
    this.times.push(time);
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = this.times.filter(t => t.barberId === barberId && new Date(t.endAt) >= now);
    return times.length > 0 ? times : null;
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]> {
    return this.times.filter((time) =>
      time.barberId === barberId &&
      new Date(time.startAt).getTime() < endDate.getTime() &&
      new Date(time.endAt).getTime() > startDate.getTime()
    );
  }

  async findById(timeId: string): Promise<Time | null> {
    const time = this.times.find(t => t.id === timeId);
    return time || null;
  }

  async deleteById(timeId: string): Promise<void> {
    const index = this.times.findIndex(t => t.id === timeId);
    if (index !== -1) {
      this.times.splice(index, 1);
    }
  }

  async updateDisponible(timeId: string, disponible: boolean): Promise<void> {
    const time = this.times.find(t => t.id === timeId) as (Time & { disponible?: boolean }) | undefined;
    if (time) {
      time.disponible = disponible;
    }
  }
}
