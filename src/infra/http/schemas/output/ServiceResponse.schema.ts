import z from "zod";

export const ServiceResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string().optional(),
  }).transform((service) => ({
    id: service.id,
    nome: service.name,
    preço: service.price.toFixed(2),
    descrição: service.description? service.description : "Sem descrição",
  }))
);