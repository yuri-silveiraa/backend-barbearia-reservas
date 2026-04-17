import { Response } from "express";
import { UnblockCustomer } from "../../../../core/use-cases/UnblockCustomer";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class UnblockCustomerController {
  constructor(private unblockCustomer: UnblockCustomer) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const customerId = req.params.id;
    if (!customerId || Array.isArray(customerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const customer = await this.unblockCustomer.execute(customerId, req.user.id);
    return res.status(200).json(customer);
  }
}
