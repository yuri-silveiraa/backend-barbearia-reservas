import { ListClientAppointmentsController } from "./ListClientAppointmentsController";
import { ListClientAppointments } from "../../../../core/use-cases/ListClientAppointments";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListClientAppointmentsController", () => {
  it("deve listar os agendamentos do cliente", async () => {
    const mockListClientAppointments = {
      execute: jest.fn().mockResolvedValue({
        data: [
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
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      }),
    };

    const controller = new ListClientAppointmentsController(mockListClientAppointments as any);

    const req = mockRequest({
      user: { id: "client-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockListClientAppointments.execute).toHaveBeenCalledWith("client-1", 1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([expect.objectContaining({ id: "1" })]),
      total: 1,
      page: 1,
      totalPages: 1,
    }));
  });

  it("deve retornar lista vazia se não houver agendamentos", async () => {
    const mockListClientAppointments = {
      execute: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, totalPages: 0 }),
    };

    const controller = new ListClientAppointmentsController(mockListClientAppointments as any);

    const req = mockRequest({
      user: { id: "client-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [], total: 0, page: 1, totalPages: 0 });
  });
});
