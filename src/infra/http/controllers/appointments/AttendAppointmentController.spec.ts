import { AttendAppointmentController } from "./AttendAppointmentController";
import { AttendAppointment } from "../../../../core/use-cases/AttendAppointment";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("AttendAppointmentController", () => {
  it("deve marcar um agendamento como atendido", async () => {
    const mockAttendAppointment = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const controller = new AttendAppointmentController(mockAttendAppointment as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      params: { id: "appointment-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockAttendAppointment.execute).toHaveBeenCalledWith({
      id: "appointment-1",
      userId: "barber-1",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Reserva atendida com sucesso");
  });

  it("deve propagar erro se o barbeiro não tiver permissão", async () => {
    const mockAttendAppointment = {
      execute: jest.fn().mockRejectedValue(new Error("Sem permissão")),
    };

    const controller = new AttendAppointmentController(mockAttendAppointment as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      params: { id: "appointment-1" },
    });

    const res = mockResponse();

    await expect(controller.handle(req as any, res)).rejects.toThrow("Sem permissão");
  });
});
