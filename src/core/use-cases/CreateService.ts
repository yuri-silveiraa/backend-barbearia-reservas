import { CreateServiceDTO } from "../dtos/CreateServiceDTO";
import { Service } from "../entities/Service";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

export class CreateService {
  constructor(
    private serviceRepository: IServiceRepository,
    private barberRepository: IBarbersRepository
  ) {}
  async execute(data: CreateServiceDTO, id: string): Promise<Service> {
    const barber = await this.barberRepository.findByUserId(id);
    if (!barber.isAdmin) {
      throw new NoAuthorizationError();
    }
    const service = await this.serviceRepository.create(data);
    return service;
  }
}