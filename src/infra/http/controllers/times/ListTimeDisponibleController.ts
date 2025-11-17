import { Request, Response } from "express";
import { ListTimeDisponible } from "../../../../core/use-cases/ListTimeDisponible";

export class ListTimeDisponibleController {
  constructor(private listTime: ListTimeDisponible) {}

  async handle(req: Request, res: Response) {
    const barberId = req.params.barberId;
    const times = await this.listTime.execute(barberId);
    const data = times.map((time) => ({
      data: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(time.date))
    }));
    return res.status(200).json(data);
  }
}