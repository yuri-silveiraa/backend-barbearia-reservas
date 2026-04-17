import { Response } from "express";
import { BlockCustomer } from "../../../../core/use-cases/BlockCustomer";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class BlockCustomerController {
  constructor(private blockCustomer: BlockCustomer) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    const customerId = req.params.id;
    if (!customerId || Array.isArray(customerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const reason = typeof req.body?.reason === "string" ? req.body.reason : undefined;

    const customer = await this.blockCustomer.execute(customerId, req.user.id, reason);
    return res.status(200).json(customer);
  }
}
