import { Time } from "../entities/Time";

export interface CreateTimeRepositoryDTO {
  barberId: string;
  startAt: Date;
  endAt: Date;
  breakStartAt?: Date | null;
  breakEndAt?: Date | null;
}

export interface ITimeRepository {
  create(data: CreateTimeRepositoryDTO): Promise<Time>;
  findByBarberId(barberId: string): Promise<Time[] | null>;
  findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]>;
  findById(timeId: string): Promise<Time | null>;
  deleteById(timeId: string): Promise<void>;
}
