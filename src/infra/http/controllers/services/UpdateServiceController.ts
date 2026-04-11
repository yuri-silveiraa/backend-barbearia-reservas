import { Request, Response } from "express";
import { UpdateService } from "../../../../core/use-cases/UpdateService";

export class UpdateServiceController {
  constructor(private updateService: UpdateService) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const idParam = Array.isArray(id) ? id[0] : id;
    const { name, price, description, duration, category, imageBase64, imageMimeType, removeImage } = req.body;

    try {
      await this.updateService.execute({
        id: idParam,
        name,
        price,
        description,
        imageBase64,
        imageMimeType,
        removeImage,
        duration,
        category,
      });

      return res.status(200).json({ message: "Serviço atualizado com sucesso" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar serviço";
      return res.status(400).json({ message });
    }
  }
}
