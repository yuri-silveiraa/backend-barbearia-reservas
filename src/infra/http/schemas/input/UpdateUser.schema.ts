import z from "zod";

export const UpdateUserSchema = z
  .object({
    name: z.string().trim().min(3, "Nome precisa ter no mínimo 3 caracteres").optional(),
    email: z.string().email("Email inválido").trim().optional(),
    telephone: z.string().trim().min(11, "Telefone inválido").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
