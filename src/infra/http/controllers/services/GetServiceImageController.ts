import { Request, Response } from "express";
import { IServiceRepository } from "../../../../core/repositories/IServiceRepository";

export class GetServiceImageController {
  constructor(private serviceRepository: IServiceRepository) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;

    if (!serviceId) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const service = await this.serviceRepository.findById(serviceId);

    if (!service || !service.imageData || !service.imageMimeType) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }

    res.setHeader("Content-Type", service.imageMimeType);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(service.imageData));
  }
}
