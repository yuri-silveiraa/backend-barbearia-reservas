import { AppError } from "./AppError";

export class NoAuthorizationError extends AppError {
  constructor() {
    super("Usuário não autorizado", 403);
  }
}