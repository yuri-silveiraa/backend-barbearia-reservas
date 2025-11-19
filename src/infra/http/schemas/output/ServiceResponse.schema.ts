import z from "zod";

export const ServiceResponseSchema = z.array(
  z.object({
    name: z.string(),
    price: z.number(),
    description: z.string(),
  }).transform((service) => ({
    nome: service.name,
    preço: service.price.toFixed(2),
    descrição: service.description,
  }))
);