import { Service } from "@prisma/client";
import { IServiceRepository } from "../repositories/IServiceRepository";

export class ListService {
  constructor(private serviceRepository: IServiceRepository) {}
  async execute(): Promise<Service[]> {
    const services = await this.serviceRepository.findAll();
    return services.map((s: Service) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      description: s.description ?? "Sem descrição",
    }));
  }
}