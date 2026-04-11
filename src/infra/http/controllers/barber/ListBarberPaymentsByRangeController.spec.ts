import { ListBarberPaymentsByRangeController } from "./ListBarberPaymentsByRangeController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListBarberPaymentsByRangeController", () => {
  it("deve converter o período local de São Paulo para UTC antes de consultar", async () => {
    const useCase = {
      execute: jest.fn().mockResolvedValue({ balance: 0, payments: [], services: [] }),
    };
    const controller = new ListBarberPaymentsByRangeController(useCase as any);
    const req = mockRequest({
      user: { id: "user-1" },
      query: {
        start: "2026-04-10",
        end: "2026-04-10",
      },
    });
    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(useCase.execute).toHaveBeenCalledWith(
      "user-1",
      new Date("2026-04-10T03:00:00.000Z"),
      new Date("2026-04-11T02:59:59.999Z")
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deve recusar período inválido", async () => {
    const useCase = {
      execute: jest.fn(),
    };
    const controller = new ListBarberPaymentsByRangeController(useCase as any);
    const req = mockRequest({
      user: { id: "user-1" },
      query: {
        start: "data-invalida",
        end: "2026-04-10",
      },
    });
    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(useCase.execute).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Período inválido" });
  });
});
