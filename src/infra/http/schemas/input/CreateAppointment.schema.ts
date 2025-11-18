import z from "zod";


export const CreateAppointmentSchema = z.object({
  barberId: z.string("ID do barbeiro é obrigatório"),
  serviceId: z.string("ID do serviço é obrigatório"),
  timeId: z.string("ID do horário é obrigatório"),
});