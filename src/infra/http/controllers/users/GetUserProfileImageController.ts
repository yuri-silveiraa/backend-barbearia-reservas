import { Request, Response } from "express";
import { IUserRepository } from "../../../../core/repositories/IUserRepository";

export class GetUserProfileImageController {
  constructor(private usersRepository: IUserRepository) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const user = await this.usersRepository.findById(userId);

    if (!user?.profileImageData || !user.profileImageMimeType) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }

    res.setHeader("Content-Type", user.profileImageMimeType);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(Buffer.from(user.profileImageData));
  }
}
