import { CanceledAppointmentController } from "./CanceledAppointmentController";
import { CanceledAppointment } from "../../../../core/use-cases/CanceledAppointment";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CanceledAppointmentController", () => {
  it("deve cancelar um agendamento com sucesso", async () => {
    const mockCanceledAppointment = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const controller = new CanceledAppointmentController(mockCanceledAppointment as any);

    const req = mockRequest({
      user: { id: "client-1" },
      params: { id: "appointment-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCanceledAppointment.execute).toHaveBeenCalledWith("client-1", "appointment-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("Cancelado com sucesso!");
  });

  it("deve propagar erro se o cliente não tiver permissão", async () => {
    const mockCanceledAppointment = {
      execute: jest.fn().mockRejectedValue(new Error("Sem permissão")),
    };

    const controller = new CanceledAppointmentController(mockCanceledAppointment as any);

    const req = mockRequest({
      user: { id: "client-1" },
      params: { id: "appointment-1" },
    });

    const res = mockResponse();

    await expect(controller.handle(req as any, res)).rejects.toThrow("Sem permissão");
  });
});
