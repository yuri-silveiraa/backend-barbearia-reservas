import { AppError } from "./AppError";

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`Usuário com o email "${email}" já existe.`, 409);
  }
}
