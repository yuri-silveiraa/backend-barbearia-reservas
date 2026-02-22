import { ListTimeDisponibleController } from "./ListTimeDisponibleController";
import { ListTimeDisponible } from "../../../../core/use-cases/ListTimeDisponible";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListTimeDisponibleController", () => {
  it("deve listar horários disponíveis do barbeiro", async () => {
    const mockListTime = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "1",
          date: new Date("2024-12-25T10:00:00"),
          disponible: true,
        },
        {
          id: "2",
          date: new Date("2024-12-25T11:00:00"),
          disponible: true,
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
