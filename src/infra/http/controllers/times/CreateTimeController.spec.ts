import { CreateTimeController } from "./CreateTimeController";
import { CreateTime } from "../../../../core/use-cases/CreateTime";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateTimeController", () => {
  it("deve criar um horário com sucesso", async () => {
    const mockCreateTime = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        barberId: "barber-1",
        date: new Date("2024-12-25T10:00:00"),
        disponible: true,
      }),
    };

    const controller = new CreateTimeController(mockCreateTime as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      body: {
        date: "2024-12-25T10:00:00",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCreateTime.execute).toHaveBeenCalledWith({
      barberId: "barber-1",
      date: "2024-12-25T10:00:00",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: "1",
      disponible: true,
    }));
  });

  it("deve propagar erro se falhar ao criar horário", async () => {
    const mockCreateTime = {
      execute: jest.fn().mockRejectedValue(new Error("Erro ao criar horário")),
    };

    const controller = new CreateTimeController(mockCreateTime as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      body: {
        date: "2024-12-25T10:00:00",
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req as any, res)).rejects.toThrow("Erro ao criar horário");
  });
});
