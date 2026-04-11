import { Response } from "express";
import { z } from "zod";
import { DateTime } from "luxon";
import { AuthenticatedRequest } from "../../helpers/requestInterface";
import { ListBarberPaymentsByRange } from "../../../../core/use-cases/ListBarberPaymentsByRange";

const QuerySchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

const BUSINESS_TIMEZONE = "America/Sao_Paulo";

function toBusinessDayBoundary(value: string, boundary: "start" | "end"): Date | null {
  const parsed = DateTime.fromISO(value, { zone: BUSINESS_TIMEZONE });

  if (!parsed.isValid) {
    return null;
  }

  const localBoundary = boundary === "start"
    ? parsed.startOf("day")
    : parsed.endOf("day");

  return localBoundary.toUTC().toJSDate();
}

export class ListBarberPaymentsByRangeController {
  constructor(private useCase: ListBarberPaymentsByRange) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { start, end } = QuerySchema.parse(req.query);
    const startDate = toBusinessDayBoundary(start, "start");
    const endDate = toBusinessDayBoundary(end, "end");

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Período inválido" });
    }

    if (startDate > endDate) {
      return res.status(400).json({ message: "Data inicial maior que data final" });
    }

    const result = await this.useCase.execute(req.user.id, startDate, endDate);
    return res.status(200).json(result);
  }
}
