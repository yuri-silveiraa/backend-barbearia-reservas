import z from "zod";

export const CreateUserSchema = z.object({
  name: z.string().trim().min(3, "Nome precisa ter no mínimo 3 caracteres"),
  email: z.email("Email inválido").trim(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  type: z.enum(["BARBER", "CLIENT"], {
    message: "Tipo de usuário inválido.",
  }),
  telephone: z.string().trim().min(11, "Telefone invalido").optional(),
});