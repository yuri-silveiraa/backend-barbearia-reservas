import z from "zod";


export const CreateAppointmentSchema = z.object({
  barberId: z.string("ID do barbeiro é obrigatório"),
  serviceIds: z.array(z.string()).min(1, "Pelo menos um serviço deve ser selecionado"),
  startAt: z.string("Horário é obrigatório").datetime("Horário inválido"),
});
