import { AppError } from "./AppError";

export class ClientNotFoundError extends AppError {
  constructor() {
    super("Client not found", 404);
  }
}