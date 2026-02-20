import { Request, Response } from "express";
import { ListTimeDisponible } from "../../../../core/use-cases/ListTimeDisponible";
import { TimesResponseSchema } from "../../schemas/output/TimeResponse.schema";

export class ListTimeDisponibleController {
  constructor(private listTime: ListTimeDisponible) {}

  async handle(req: Request, res: Response) {
    const barberId = req.params.barberId as string;
    const times = await this.listTime.execute(barberId);
    const data = TimesResponseSchema.parse(times);
    return res.status(200).json(data);
  }
}