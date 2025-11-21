import { Request, Response } from "express";
import { CreateTime } from "../../../../core/use-cases/CreateTime";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class CreateTimeController {
  constructor(
    private createTime: CreateTime
  ){}

  async handle(req: AuthenticatedRequest, res: Response) {
    const time = await this.createTime.execute({ 
      barberId: req.user.id,
      date: req.body.date
    });
    return res.status(201).json(time);
  }
}