import { Request, Response } from "express";
import { UpdateService } from "../../../../core/use-cases/UpdateService";

export class UpdateServiceController {
  constructor(private updateService: UpdateService) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const idParam = Array.isArray(id) ? id[0] : id;
    const { name, price, description, duration, category } = req.body;

    try {
      const service = await this.updateService.execute({
        id: idParam,
        name,
        price,
        description,
        duration,
        category,
      });

      return res.json(service);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao atualizar serviço";
      return res.status(400).json({ message });
    }
  }
}
