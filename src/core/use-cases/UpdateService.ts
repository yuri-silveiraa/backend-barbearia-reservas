import { IServiceRepository } from "../repositories/IServiceRepository";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { AppError } from "../errors/AppError";

function decodeBase64Image(imageBase64: string): Uint8Array<ArrayBuffer> {
  const nodeBuffer = Buffer.from(imageBase64, "base64");
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
  const bytes = new Uint8Array(arrayBuffer);
  bytes.set(nodeBuffer);
  return bytes;
}

export interface UpdateServiceDTO {
  id: string;
  barberUserId: string;
  name?: string;
  price?: number;
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
  removeImage?: boolean;
  durationMinutes?: number;
  category?: string;
}

export class UpdateService {
  constructor(
    private serviceRepository: IServiceRepository,
    private barberRepository: IBarbersRepository,
  ) {}

  async execute(data: UpdateServiceDTO) {
    const barber = await this.barberRepository.findByUserId(data.barberUserId);
    if (!barber || !barber.isActive) {
      throw new AppError("Barbeiro não encontrado", 404);
    }

    const service = await this.serviceRepository.findById(data.id);

    if (!service) {
      throw new Error("Serviço não encontrado");
    }
    if (service.barberId !== barber.id) {
      throw new AppError("Serviço não pertence ao barbeiro autenticado", 403);
    }

    if (data.durationMinutes !== undefined && (!Number.isInteger(data.durationMinutes) || data.durationMinutes < 15)) {
      throw new AppError("Duração mínima é 15 minutos", 400);
    }

    const updated = await this.serviceRepository.update(data.id, {
      name: data.name,
      price: data.price,
      description: data.description,
      durationMinutes: data.durationMinutes,
      imageData: data.removeImage
        ? null
        : data.imageBase64
          ? decodeBase64Image(data.imageBase64)
          : undefined,
      imageMimeType: data.removeImage ? null : data.imageMimeType,
      category: data.category,
    });

    return updated;
  }
}
