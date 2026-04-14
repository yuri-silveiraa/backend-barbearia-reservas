import { Time } from "../entities/Time";

export interface CreateTimeRepositoryDTO {
  barberId: string;
  date: Date;
  duration?: number;
}

export interface ITimeRepository {
  create(data: CreateTimeRepositoryDTO): Promise<Time>;
  findByBarberId(barberId: string): Promise<Time[] | null>;
  findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]>;
  findAvailableByBarberId(barberId: string): Promise<Time[] | null>;
  findById(timeId: string): Promise<Time | null>;
  updateDisponible(timeId: string, disponible: boolean): Promise<void>;
  deleteById(timeId: string): Promise<void>;
}
