import { AppError } from "./AppError";

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuario nao encontrado", 404);
  }
}