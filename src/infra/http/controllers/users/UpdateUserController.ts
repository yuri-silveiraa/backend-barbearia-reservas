import { Response } from "express";
import { UpdateUser } from "../../../../core/use-cases/UpdateUser";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class UpdateUserController {
  constructor(private updateUser: UpdateUser) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const updated = await this.updateUser.execute({
      userId: req.user.id,
      ...req.body,
    });

    const { password, ...userWithoutPassword } = updated as { password?: string };
    const responseUser = {
      ...userWithoutPassword,
      isAdmin: updated.barber?.isAdmin ?? false,
    };

    return res.status(200).json({ user: responseUser });
  }
}
