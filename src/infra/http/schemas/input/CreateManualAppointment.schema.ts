import z from "zod";

export const CreateManualAppointmentSchema = z.object({
  customerName: z.string("Nome do cliente é obrigatório").trim().min(2, "Nome do cliente é obrigatório"),
  customerWhatsapp: z.string("WhatsApp é obrigatório").trim().min(10, "WhatsApp inválido"),
  serviceId: z.string("ID do serviço é obrigatório"),
  timeId: z.string("ID do horário é obrigatório"),
});
