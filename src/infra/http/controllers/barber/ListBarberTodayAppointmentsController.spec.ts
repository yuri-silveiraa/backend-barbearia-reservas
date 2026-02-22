import { ListBarberTodayAppointmentsController } from "./ListBarberTodayAppointmentsController";
import { ListBarberTodayAppointments } from "../../../../core/use-cases/ListBarberTodayAppointments";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListBarberTodayAppointmentsController", () => {
  it("deve listar os agendamentos de hoje do barbeiro", async () => {
    const mockListBarberTodayAppointments = {
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

    const controller = new ListBarberTodayAppointmentsController(mockListBarberTodayAppointments as any);

    const req = mockRequest({
      user: { id: "barber-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockListBarberTodayAppointments.execute).toHaveBeenCalledWith("barber-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ id: "1" }),
    ]));
  });

  it("deve retornar lista vazia se não houver agendamentos", async () => {
    const mockListBarberTodayAppointments = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const controller = new ListBarberTodayAppointmentsController(mockListBarberTodayAppointments as any);

    const req = mockRequest({
      user: { id: "barber-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
