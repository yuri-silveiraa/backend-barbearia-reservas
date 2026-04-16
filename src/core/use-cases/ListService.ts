import { IServiceRepository } from "../repositories/IServiceRepository";

export interface ListedService {
  id: string;
  barberId: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
}

export class ListService {
  constructor(private serviceRepository: IServiceRepository) {}
  async execute(barberId?: string): Promise<ListedService[]> {
    const services = barberId
      ? await this.serviceRepository.findAll(barberId)
      : await this.serviceRepository.findAdminServices();

    return services.map((s) => ({
      id: s.id,
      barberId: s.barberId,
      name: s.name,
      price: s.price,
      durationMinutes: s.durationMinutes,
      description: s.description ?? "Sem descrição",
      imageUrl: s.imageData ? `/api/service/${s.id}/image?v=${Date.now()}` : null,
      active: s.active ?? true,
    }));
  }
}
