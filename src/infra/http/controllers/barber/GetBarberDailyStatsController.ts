import { Response } from "express";
import { GetBarberDailyStats } from "../../../../core/use-cases/GetBarberDailyStats";
import { AuthenticatedRequest } from "../../helpers/requestInterface";

export class GetBarberDailyStatsController {
  constructor(private getBarberDailyStats: GetBarberDailyStats) {}

  async handle(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const stats = await this.getBarberDailyStats.execute(req.user.id);
    return res.status(200).json(stats);
  }
}
