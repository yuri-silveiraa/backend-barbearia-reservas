import z from "zod";

export const BarberResponseSchema = z.array(
  z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    isAdmin: z.boolean(),
    isActive: z.boolean(),
    createdAt: z.date(),
  }).transform((barber) => ({
    id: barber.id,
    userId: barber.userId,
    nome: barber.name,
  }))
)