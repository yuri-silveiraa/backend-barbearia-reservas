import { ListTimeDisponibleController } from "./ListTimeDisponibleController";
import { ListTimeDisponible } from "../../../../core/use-cases/ListTimeDisponible";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListTimeDisponibleController", () => {
  it("deve listar horários disponíveis do barbeiro", async () => {
    const mockListTime = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "1",
          startAt: new Date("2030-04-10T08:00:00.000Z"),
          endAt: new Date("2030-04-10T18:00:00.000Z"),
          breakStartAt: null,
          breakEndAt: null,
        },
        {
          id: "2",
          startAt: new Date("2030-04-11T08:00:00.000Z"),
          endAt: new Date("2030-04-11T18:00:00.000Z"),
          breakStartAt: null,
          breakEndAt: null,
        },
      ]),
    };

    const controller = new ListTimeDisponibleController(mockListTime as any);

    const req = mockRequest({
      params: { barberId: "barber-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockListTime.execute).toHaveBeenCalledWith("barber-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: "1" }),
      expect.objectContaining({ id: "2" }),
    ]));
  });

  it("deve retornar lista vazia se não houver horários", async () => {
    const mockListTime = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const controller = new ListTimeDisponibleController(mockListTime as any);

    const req = mockRequest({
      params: { barberId: "barber-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
