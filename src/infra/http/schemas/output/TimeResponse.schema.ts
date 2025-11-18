import z from "zod";
import { id } from "zod/v4/locales";

export const TimesResponseSchema = z.array(
  z.object({
    id: z.string(),
    date: z.date(),
  }).transform((time) => ({
    data: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(time.date)),
    id: time.id,
  }))
);