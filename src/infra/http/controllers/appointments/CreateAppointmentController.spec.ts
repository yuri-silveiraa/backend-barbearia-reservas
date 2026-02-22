import { CreateAppointmentController } from "./CreateAppointmentController";
import { CreateAppointment } from "../../../../core/use-cases/CreateAppointment";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateAppointmentController", () => {
  it("deve criar um agendamento com sucesso", async () => {
    const mockCreateAppointment = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        barberId: "barber-1",
        clientId: "client-1",
        serviceId: "service-1",
        timeId: "time-1",
        status: "SCHEDULED",
        createdAt: new Date(),
      }),
    };

    const controller = new CreateAppointmentController(mockCreateAppointment as any);

    const req = mockRequest({
      user: { id: "client-1" },
      body: {
        barberId: "barber-1",
        serviceId: "service-1",
        timeId: "time-1",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCreateAppointment.execute).toHaveBeenCalledWith({
      barberId: "barber-1",
      clientId: "client-1",
      serviceId: "service-1",
      timeId: "time-1",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
      id: "1",
      status: "SCHEDULED",
    }));
  });

  it("deve retornar 401 se o usuário não estiver autenticado", async () => {
    const mockCreateAppointment = {
      execute: jest.fn(),
    };

    const controller = new CreateAppointmentController(mockCreateAppointment as any);

    const req = mockRequest({
      user: {} as any,
      body: {
        barberId: "barber-1",
        serviceId: "service-1",
        timeId: "time-1",
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
    expect(mockCreateAppointment.execute).not.toHaveBeenCalled();
  });
});
