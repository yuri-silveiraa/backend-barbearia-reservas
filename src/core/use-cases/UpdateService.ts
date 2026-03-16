import { IServiceRepository } from "../repositories/IServiceRepository";

export interface UpdateServiceDTO {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  duration?: number;
  category?: string;
}

export class UpdateService {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(data: UpdateServiceDTO) {
    const service = await this.serviceRepository.findById(data.id);

    if (!service) {
      throw new Error("Serviço não encontrado");
    }

    const updated = await this.serviceRepository.update(data.id, {
      name: data.name,
      price: data.price,
      description: data.description,
      duration: data.duration,
      category: data.category,
    });

    return updated;
  }
}
