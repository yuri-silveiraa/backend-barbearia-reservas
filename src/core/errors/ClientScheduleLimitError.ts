import { AppError } from "./AppError";

export class ClientScheduleLimitError extends AppError {
  constructor() {
    super("Você atingiu o limite de criação de agendamentos na última semana", 400);
  }
}