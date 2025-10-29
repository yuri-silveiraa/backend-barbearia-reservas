import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email("Email inválido").trim(),
  password: z.string(),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;