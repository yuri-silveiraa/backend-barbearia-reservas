import { Response } from "express";
import { DeleteMeUser } from "../../../../core/use-cases/DeleteMeUser";
import { AuthenticatedRequest } from "../../helpers/requestInterface";
import { getAuthCookieClearOptions } from "../../helpers/authCookie";

export class DeleteMeUserController {
  constructor(private deleteMeUser: DeleteMeUser) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    await this.deleteMeUser.execute(req.user.id);
    res.clearCookie("token", getAuthCookieClearOptions(req));
    return res.status(204).send();
  }
}
