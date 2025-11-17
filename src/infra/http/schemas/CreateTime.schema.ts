import z from "zod";

export const CreateTimeSchema = z.object({
  date: z.string("Data é obrigatória").refine((date) => !isNaN(Date.parse(date)), {
    message: "Data inválida",
  }),
});