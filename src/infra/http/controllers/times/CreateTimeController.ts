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
      startAt: new Date(req.body.startAt),
      endAt: new Date(req.body.endAt),
      breakStartAt: req.body.breakStartAt ? new Date(req.body.breakStartAt) : null,
      breakEndAt: req.body.breakEndAt ? new Date(req.body.breakEndAt) : null,
    });
    return res.status(201).json(time);
  }
}
