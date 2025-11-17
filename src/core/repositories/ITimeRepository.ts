import { Time } from "../entities/Time";

export interface ITimeRepository {
  create(data: Omit<Time, "id" | "disponible">): Promise<Time>;
  findByBarberId(barberId: string): Promise<Time[] | null>;
  updateDisponible(timeId: string, disponible: boolean): Promise<void>;
}