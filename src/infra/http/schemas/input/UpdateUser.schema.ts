import z from "zod";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const UpdateUserSchema = z
  .object({
    name: z.string().trim().min(3, "Nome precisa ter no mínimo 3 caracteres").optional(),
    email: z.string().email("Email inválido").trim().optional(),
    telephone: z.string().trim().min(11, "Telefone inválido").optional(),
    profileImageBase64: z
      .string()
      .optional()
      .refine((value) => !value || Buffer.byteLength(value, "base64") <= MAX_IMAGE_SIZE_BYTES, {
        message: "Imagem muito grande. Envie uma imagem de até 5MB.",
      }),
    profileImageMimeType: z
      .string()
      .optional()
      .refine((value) => !value || ["image/jpeg", "image/png", "image/webp"].includes(value), {
        message: "Formato de imagem inválido",
      }),
    removeProfileImage: z.boolean().optional(),
  })
  .refine((data) => {
    if (!data.profileImageBase64 && !data.profileImageMimeType) return true;
    return Boolean(data.profileImageBase64 && data.profileImageMimeType);
  }, {
    message: "Imagem de perfil inválida",
    path: ["profileImageBase64"],
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
