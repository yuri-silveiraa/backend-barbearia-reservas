import z from "zod";

export const GenerateTimeSlotsSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato: HH:MM"),
  blockDuration: z.coerce.number().min(15).max(180),
  intervalStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato: HH:MM").optional(),
  intervalDuration: z.coerce.number().min(0).max(120).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data inválida",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Data inválida",
  }),
  excludeDays: z.array(z.number().min(0).max(6)).optional(),
  selectedOption: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

export type GenerateTimeSlotsInput = z.infer<typeof GenerateTimeSlotsSchema>;
