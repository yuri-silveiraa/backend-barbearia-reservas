import { CreateAppointmentController } from "./CreateAppointmentController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateAppointmentController", () => {
  it("deve criar um agendamento com sucesso", async () => {
    const mockCreateAppointment = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        barberId: "barber-1",
        clientId: "client-1",
        serviceIds: ["service-1"],
        scheduledAt: new Date("2030-04-10T10:00:00.000Z"),
        scheduledEndAt: new Date("2030-04-10T10:30:00.000Z"),
        serviceDurationMinutes: 30,
        status: "SCHEDULED",
        createdAt: new Date(),
      }),
    };

    const controller = new CreateAppointmentController(mockCreateAppointment as any);

    const req = mockRequest({
      user: { id: "client-1" },
      body: {
        barberId: "barber-1",
        serviceIds: ["service-1"],
        startAt: "2030-04-10T10:00:00.000Z",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCreateAppointment.execute).toHaveBeenCalledWith({
      barberId: "barber-1",
      clientId: "client-1",
      serviceIds: ["service-1"],
      startAt: "2030-04-10T10:00:00.000Z",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      id: "1",
      status: "SCHEDULED",
    }));
  });

  it("deve retornar 401 se o usuário não estiver autenticado", async () => {
    const mockCreateAppointment = { execute: jest.fn() };
    const controller = new CreateAppointmentController(mockCreateAppointment as any);

    const req = mockRequest({
      user: {} as any,
      body: {
        barberId: "barber-1",
        serviceIds: ["service-1"],
        startAt: "2030-04-10T10:00:00.000Z",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
    expect(mockCreateAppointment.execute).not.toHaveBeenCalled();
  });
});
