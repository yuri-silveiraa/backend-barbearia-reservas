import { Response } from "express";
import { GetMeUser } from "../../../../core/use-cases/getMeUser";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class GetMeUserController {
  constructor (private getMeUser: GetMeUser) {}

  async handle(req: AuthenticatedRequest, res: Response) {
    console.log("GetMeUserController - User ID:", req.user?.id);
    if (!req.user?.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    const user = await this.getMeUser.execute(req.user?.id);
    return res.status(200).json(user);
  }
}