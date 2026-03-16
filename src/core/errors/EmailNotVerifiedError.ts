import { AppError } from "./AppError";

export class EmailNotVerifiedError extends AppError {
  constructor() {
    super("Email não verificado. Verifique seu email para continuar.", 403);
  }
}
