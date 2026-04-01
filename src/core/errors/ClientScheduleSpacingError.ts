import { AppError } from "./AppError";

export class ClientScheduleSpacingError extends AppError {
  constructor() {
    super("Você já tem um agendamento muito próximo. Escolha uma data com pelo menos 7 dias de diferença.", 400);
  }
}
