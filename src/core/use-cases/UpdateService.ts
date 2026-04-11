import { IServiceRepository } from "../repositories/IServiceRepository";

function decodeBase64Image(imageBase64: string): Uint8Array<ArrayBuffer> {
  const nodeBuffer = Buffer.from(imageBase64, "base64");
  const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
  const bytes = new Uint8Array(arrayBuffer);
  bytes.set(nodeBuffer);
  return bytes;
}

export interface UpdateServiceDTO {
  id: string;
  name?: string;
  price?: number;
  description?: string;
  imageBase64?: string;
  imageMimeType?: string;
  removeImage?: boolean;
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
      imageData: data.removeImage
        ? null
        : data.imageBase64
          ? decodeBase64Image(data.imageBase64)
          : undefined,
      imageMimeType: data.removeImage ? null : data.imageMimeType,
      duration: data.duration,
      category: data.category,
    });

    return updated;
  }
}
