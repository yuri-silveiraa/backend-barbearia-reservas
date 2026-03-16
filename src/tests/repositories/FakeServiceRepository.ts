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

  async update(id: string, data: Partial<Service>): Promise<Service> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error("Serviço não encontrado");
    }
    const service = this.services[index];
    const updated: Service = {
      ...service,
      ...data,
      id: service.id,
    };
    this.services[index] = updated;
    return updated;
  }
}
