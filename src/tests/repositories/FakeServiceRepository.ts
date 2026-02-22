import { Service } from "../../core/entities/Service";
import { IServiceRepository } from "../../core/repositories/IServiceRepository";

export class FakeServiceRepository implements IServiceRepository {
  private services: Service[] = [];

  async create(data: Omit<Service, "id">): Promise<Service> {
    const service: Service = {
      id: String(this.services.length + 1),
      name: data.name,
      description: data.description,
      price: data.price,
    };
    this.services.push(service);
    return service;
  }

  async findById(id: string): Promise<Service | null> {
    const service = this.services.find(s => s.id === id);
    return service || null;
  }

  async deleteById(id: string): Promise<void> {
    this.services = this.services.filter(s => s.id !== id);
  }

  async findAll(): Promise<Service[]> {
    return this.services;
  }
}
