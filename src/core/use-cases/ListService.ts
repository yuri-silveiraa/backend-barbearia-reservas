import { IServiceRepository } from "../repositories/IServiceRepository";

export interface ListedService {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  active: boolean;
}

export class ListService {
  constructor(private serviceRepository: IServiceRepository) {}
  async execute(): Promise<ListedService[]> {
    const services = await this.serviceRepository.findAll();
    return services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      description: s.description ?? "Sem descrição",
      imageUrl: s.imageData ? `/api/service/${s.id}/image?v=${Date.now()}` : null,
      active: s.active ?? true,
    }));
  }
}
