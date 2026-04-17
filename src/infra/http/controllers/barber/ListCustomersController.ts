import { Response } from "express";
import { ListCustomers } from "../../../../core/use-cases/ListCustomers";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class ListCustomersController {
  constructor(private listCustomers: ListCustomers) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Acesso permitido apenas para administradores" });
    }

    const customers = await this.listCustomers.execute();
    return res.status(200).json(customers);
  }
}
