import { Service } from "../../core/entities/Service";
import { IServiceRepository } from "../../core/repositories/IServiceRepository";

export class FakeServiceRepository implements IServiceRepository {
  private services: Service[] = [];

  async create(data: Omit<Service, "id"> | Partial<Omit<Service, "id">>): Promise<Service> {
    const service: Service = {
      id: String(this.services.length + 1),
      name: data.name ?? "Serviço",
      description: data.description,
      price: data.price ?? 0,
      barberId: data.barberId ?? "1",
      durationMinutes: data.durationMinutes ?? 30,
      imageData: data.imageData,
      imageMimeType: data.imageMimeType,
      active: data.active ?? true,
    };
    this.services.push(service);
    return service;
  }

  async findById(id: string): Promise<Service | null> {
    const service = this.services.find(s => s.id === id);
    return service || null;
  }

  async findByIds(ids: string[]): Promise<Service[]> {
    return this.services.filter((service) => ids.includes(service.id));
  }

  async deleteById(id: string): Promise<void> {
    this.services = this.services.filter(s => s.id !== id);
  }

  async findAll(barberId?: string): Promise<Service[]> {
    return this.services.filter((service) => service.active !== false && (!barberId || service.barberId === barberId));
  }

  async findAdminServices(): Promise<Service[]> {
    return this.services.filter((service) => service.active !== false);
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
