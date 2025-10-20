import { Time } from "../entities/Time";

export interface ITimeRepository {
  create(data: Omit<Time, "id">): Promise<Time>;
  findByBarberIdAndDate(barberId: string, date: Date): Promise<Time | null>;
}