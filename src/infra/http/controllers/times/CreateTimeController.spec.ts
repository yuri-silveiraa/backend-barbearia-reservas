import { CreateTimeController } from "./CreateTimeController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateTimeController", () => {
  it("deve criar uma jornada com sucesso", async () => {
    const mockCreateTime = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        barberId: "barber-1",
        startAt: new Date("2030-04-10T08:00:00.000Z"),
        endAt: new Date("2030-04-10T18:00:00.000Z"),
        breakStartAt: null,
        breakEndAt: null,
      }),
    };

    const controller = new CreateTimeController(mockCreateTime as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      body: {
        startAt: "2030-04-10T08:00:00.000Z",
        endAt: "2030-04-10T18:00:00.000Z",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCreateTime.execute).toHaveBeenCalledWith({
      barberId: "barber-1",
      startAt: new Date("2030-04-10T08:00:00.000Z"),
      endAt: new Date("2030-04-10T18:00:00.000Z"),
      breakStartAt: null,
      breakEndAt: null,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
  });

  it("deve propagar erro se falhar ao criar jornada", async () => {
    const mockCreateTime = { execute: jest.fn().mockRejectedValue(new Error("Erro ao criar horário")) };
    const controller = new CreateTimeController(mockCreateTime as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      body: {
        startAt: "2030-04-10T08:00:00.000Z",
        endAt: "2030-04-10T18:00:00.000Z",
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req as any, res)).rejects.toThrow("Erro ao criar horário");
  });
});
