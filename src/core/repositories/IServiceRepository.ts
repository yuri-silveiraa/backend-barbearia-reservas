import { Service } from "../entities/Service";

export interface IServiceRepository {
  create(data: Omit<Service, "id">): Promise<Service>;
  findById(id: string): Promise<Service | null>;
  findByIds(ids: string[]): Promise<Service[]>;
  deleteById(id: string): Promise<void>;
  findAll(barberId?: string): Promise<Service[]>;
  findAdminServices(): Promise<Service[]>;
  update(id: string, data: Partial<Service>): Promise<Service>;
}
