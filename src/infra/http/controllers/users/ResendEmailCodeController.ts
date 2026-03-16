import { Request, Response } from "express";
import { ResendEmailCode } from "../../../../core/use-cases/ResendEmailCode";

export class ResendEmailCodeController {
  constructor(private resendEmailCode: ResendEmailCode) {}

  async handle(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email é obrigatório" });
    }

    try {
      const result = await this.resendEmailCode.execute({ email });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.json({ message: result.message });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao reenviar código" });
    }
  }
}
