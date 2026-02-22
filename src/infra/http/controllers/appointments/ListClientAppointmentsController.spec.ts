import { ListClientAppointmentsController } from "./ListClientAppointmentsController";
import { ListClientAppointments } from "../../../../core/use-cases/ListClientAppointments";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListClientAppointmentsController", () => {
  it("deve listar os agendamentos do cliente", async () => {
    const mockListClientAppointments = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "1",
          clientId: "client-1",
          barberId: "barber-1",
          serviceId: "service-1",
          client: "Yuri",
          barber: "Carlos",
          service: "Corte",
          time: new Date(),
          status: "SCHEDULED",
        },
      ]),
    };

    const controller = new ListClientAppointmentsController(mockListClientAppointments as any);

    const req = mockRequest({
      user: { id: "client-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockListClientAppointments.execute).toHaveBeenCalledWith("client-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: "1" }),
    ]));
  });

  it("deve retornar lista vazia se não houver agendamentos", async () => {
    const mockListClientAppointments = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const controller = new ListClientAppointmentsController(mockListClientAppointments as any);

    const req = mockRequest({
      user: { id: "client-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
