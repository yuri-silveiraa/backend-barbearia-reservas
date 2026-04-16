import { Request, Response } from "express";
import { ListService } from "../../../../core/use-cases/ListService";
import { ServiceResponseSchema } from "../../schemas/output/ServiceResponse.schema";

export class ListServiceController {
  constructor(private listService: ListService) {}
  async handle(req: Request, res: Response) {
    const barberId = typeof req.query.barberId === "string" ? req.query.barberId : undefined;
    const services = await this.listService.execute(barberId);
    const data = ServiceResponseSchema.parse(services);
    return res.status(200).json(data);
  }
}
