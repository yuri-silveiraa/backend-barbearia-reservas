import { AppError } from "./AppError";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("email ou senha invalidos", 401);
  }
}
