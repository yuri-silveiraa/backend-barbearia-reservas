import z from "zod";

export const CreateServiceSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  description: z.string().optional(),
});