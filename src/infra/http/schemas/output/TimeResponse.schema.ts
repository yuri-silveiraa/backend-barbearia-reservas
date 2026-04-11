import z from "zod";
import { formatBusinessDateTime } from "../../../../core/utils/businessDate";

export const TimesResponseSchema = z.array(
  z.object({
    id: z.string(),
    date: z.date(),
  }).transform((time) => ({
    data: formatBusinessDateTime(time.date),
    id: time.id,
  }))
);
