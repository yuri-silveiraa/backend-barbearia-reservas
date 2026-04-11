import { CreateServiceDTO } from "../dtos/CreateServiceDTO";
import { Service } from "../entities/Service";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

function decodeBase64Image(imageBase64: string): Uint8Array<ArrayBuffer> {
  const nodeBuffer = Buffer.from(imageBase64, "base64");
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
  const bytes = new Uint8Array(arrayBuffer);
  bytes.set(nodeBuffer);
  return bytes;
}

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
    const service = await this.serviceRepository.create({
      name: data.name,
      price: data.price,
      description: data.description,
      imageData: data.imageBase64 ? decodeBase64Image(data.imageBase64) : undefined,
      imageMimeType: data.imageMimeType,
    });
    return service;
  }
}
