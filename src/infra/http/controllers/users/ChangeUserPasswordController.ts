import { Response } from "express";
import { ChangeUserPassword } from "../../../../core/use-cases/ChangeUserPassword";
import { AuthenticatedRequest } from "../../helpers/requestInterface";
import { toUserResponse } from "../../helpers/userResponse";

export class ChangeUserPasswordController {
  constructor(private changeUserPassword: ChangeUserPassword) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const updated = await this.changeUserPassword.execute({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    });

    const responseUser = {
      ...toUserResponse(updated),
      isAdmin: updated.barber?.isAdmin ?? false,
    };

    return res.status(200).json({
      message: "Senha atualizada com sucesso",
      user: responseUser,
    });
  }
}
