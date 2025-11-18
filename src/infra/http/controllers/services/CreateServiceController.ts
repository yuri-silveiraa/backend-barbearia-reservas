import { Response } from "express";
import { CreateService } from "../../../../core/use-cases/CreateService";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class CreateServiceController {
  constructor(private createService: CreateService) {}
  async handle(req: AuthenticatedRequest, res: Response) {
    await this.createService.execute(req.body, req.user.id);
    return res.status(201).send("Serviço criado com sucesso");
  }
}