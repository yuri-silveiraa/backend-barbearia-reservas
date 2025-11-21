import { Response } from "express";
import { ListService } from "../../../../core/use-cases/ListService";
import { ServiceResponseSchema } from "../../schemas/output/ServiceResponse.schema";

export class ListServiceController {
  constructor(private listService: ListService) {}
  async handle(res: Response) {
    const services = await this.listService.execute();
    const data = ServiceResponseSchema.parse(services);
    return res.status(200).json(data);
  }
}
