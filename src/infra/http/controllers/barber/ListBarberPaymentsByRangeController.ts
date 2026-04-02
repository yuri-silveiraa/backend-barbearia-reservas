import { Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../../helpers/requestInterface";
import { ListBarberPaymentsByRange } from "../../../../core/use-cases/ListBarberPaymentsByRange";

const QuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

function toStartOfDay(value: string): Date {
  const date = new Date(`${value}T00:00:00`);
  return date;
}

function toEndOfDay(value: string): Date {
  const date = new Date(`${value}T23:59:59.999`);
  return date;
}

export class ListBarberPaymentsByRangeController {
  constructor(private useCase: ListBarberPaymentsByRange) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { start, end } = QuerySchema.parse(req.query);
    const startDate = toStartOfDay(start);
    const endDate = toEndOfDay(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Período inválido" });
    }

    if (startDate > endDate) {
      return res.status(400).json({ message: "Data inicial maior que data final" });
    }

    const result = await this.useCase.execute(req.user.id, startDate, endDate);
    return res.status(200).json(result);
  }
}
