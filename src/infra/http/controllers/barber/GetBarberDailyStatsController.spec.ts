import { GetBarberDailyStatsController } from "./GetBarberDailyStatsController";
import { GetBarberDailyStats } from "../../../../core/use-cases/GetBarberDailyStats";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("GetBarberDailyStatsController", () => {
  it("deve retornar estatísticas do dia do barbeiro", async () => {
    const mockGetBarberDailyStats = {
      execute: jest.fn().mockResolvedValue({
        completedCount: 5,
        scheduledCount: 3,
        totalRevenue: 250,
      }),
    };

    const controller = new GetBarberDailyStatsController(mockGetBarberDailyStats as any);

    const req = mockRequest({
      user: { id: "barber-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockGetBarberDailyStats.execute).toHaveBeenCalledWith("barber-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      completedCount: 5,
      scheduledCount: 3,
      totalRevenue: 250,
    });
  });
});
