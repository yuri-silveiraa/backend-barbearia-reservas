import z from "zod";

export const ServiceResponseSchema = z.array(
  z.object({
    id: z.string(),
    barberId: z.string(),
    name: z.string(),
    price: z.number(),
    durationMinutes: z.number(),
    description: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
  }).transform((service) => ({
    id: service.id,
    barberId: service.barberId,
    nome: service.name,
    name: service.name,
    preço: service.price.toFixed(2),
    price: service.price,
    duration: service.durationMinutes,
    durationMinutes: service.durationMinutes,
    descrição: service.description? service.description : "Sem descrição",
    description: service.description? service.description : "Sem descrição",
    imagemUrl: service.imageUrl ?? null,
    imageUrl: service.imageUrl ?? null,
  }))
);
