import z from "zod";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const CreateServiceSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  durationMinutes: z.coerce.number().int().min(15, "Duração mínima é 15 minutos").max(480, "Duração máxima é 480 minutos"),
  description: z.string().optional(),
  imageBase64: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Buffer.byteLength(value, "base64") <= MAX_IMAGE_SIZE_BYTES;
    }, "Imagem deve ter no máximo 5MB"),
  imageMimeType: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return ["image/jpeg", "image/png", "image/webp"].includes(value);
    }, "Formato de imagem inválido"),
}).refine((data) => {
  if (!data.imageBase64 && !data.imageMimeType) return true;
  return Boolean(data.imageBase64 && data.imageMimeType);
}, {
  message: "Imagem inválida",
  path: ["imageBase64"],
});
