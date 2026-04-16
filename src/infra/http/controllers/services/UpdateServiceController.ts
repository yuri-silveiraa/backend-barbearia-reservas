import { Response } from "express";
import { UpdateService } from "../../../../core/use-cases/UpdateService";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class UpdateServiceController {
  constructor(private updateService: UpdateService) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const idParam = Array.isArray(id) ? id[0] : id;
    const { name, price, description, durationMinutes, category, imageBase64, imageMimeType, removeImage } = req.body;

    try {
      await this.updateService.execute({
        id: idParam,
        barberUserId: req.user.id,
        name,
        price,
        description,
        imageBase64,
        imageMimeType,
        removeImage,
        durationMinutes,
        category,
      });

      return res.status(200).json({ message: "Serviço atualizado com sucesso" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar serviço";
      return res.status(400).json({ message });
    }
  }
}
