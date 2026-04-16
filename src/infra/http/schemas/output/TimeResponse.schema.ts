import z from "zod";
import { formatBusinessDateTime } from "../../../../core/utils/businessDate";

export const TimesResponseSchema = z.array(
  z.object({
    id: z.string(),
    startAt: z.date(),
    endAt: z.date(),
    breakStartAt: z.date().nullable().optional(),
    breakEndAt: z.date().nullable().optional(),
  }).transform((time) => ({
    data: formatBusinessDateTime(time.startAt),
    date: time.startAt.toISOString(),
    startAt: time.startAt.toISOString(),
    endAt: time.endAt.toISOString(),
    breakStartAt: time.breakStartAt?.toISOString() ?? null,
    breakEndAt: time.breakEndAt?.toISOString() ?? null,
    id: time.id,
  }))
);
