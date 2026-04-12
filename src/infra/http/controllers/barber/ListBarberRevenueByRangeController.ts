import { Response } from "express";
import { z } from "zod";
import { businessDayBoundary } from "../../../../core/utils/businessDate";
import { AuthenticatedRequest } from "../../helpers/requestInterface";
import { ListBarberRevenueByRange } from "../../../../core/use-cases/ListBarberRevenueByRange";

const QuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  serviceId: z.string().uuid().optional(),
});

export class ListBarberRevenueByRangeController {
  constructor(private useCase: ListBarberRevenueByRange) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const query = QuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ message: "Período inválido" });
    }

    const { start, end, serviceId } = query.data;
    const startDate = businessDayBoundary(start, "start");
    const endDate = businessDayBoundary(end, "end");

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Período inválido" });
    }

    if (startDate > endDate) {
      return res.status(400).json({ message: "Data inicial maior que data final" });
    }

    const result = await this.useCase.execute(req.user.id, startDate, endDate, serviceId);
    return res.status(200).json(result);
  }
}
