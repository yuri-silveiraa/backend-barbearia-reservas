import { Service } from "../entities/Service";

export interface IServiceRepository {
  create(data: Omit<Service, "id">): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  deleteById(id: string): Promise<void>;
  findAll(): Promise<Service[]>;
}