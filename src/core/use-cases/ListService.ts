import { IServiceRepository } from "../repositories/IServiceRepository";

export class ListService {
  constructor(private serviceRepository: IServiceRepository) {}
  async execute() {
    const services = await this.serviceRepository.findAll();
    return services;
  }
}