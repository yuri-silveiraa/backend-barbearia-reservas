import z from "zod";

export const CreateTimeSchema = z.object({
  startAt: z.string("Início é obrigatório").datetime("Início inválido"),
  endAt: z.string("Fim é obrigatório").datetime("Fim inválido"),
  breakStartAt: z.string().datetime("Início do intervalo inválido").optional(),
  breakEndAt: z.string().datetime("Fim do intervalo inválido").optional(),
});
