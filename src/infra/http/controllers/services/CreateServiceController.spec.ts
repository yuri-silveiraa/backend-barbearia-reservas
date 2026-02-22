import { CreateServiceController } from "./CreateServiceController";
import { CreateService } from "../../../../core/use-cases/CreateService";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateServiceController", () => {
  it("deve criar um serviço com sucesso", async () => {
    const mockCreateService = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        name: "Corte Tradicional",
        description: "Corte masculino tradicional",
        price: 35,
      }),
    };

    const controller = new CreateServiceController(mockCreateService as any);

    const req = mockRequest({
      user: { id: "admin-1" },
      body: {
        name: "Corte Tradicional",
        description: "Corte masculino tradicional",
        price: 35,
      },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockCreateService.execute).toHaveBeenCalledWith(
      {
        name: "Corte Tradicional",
        description: "Corte masculino tradicional",
        price: 35,
      },
      "admin-1"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith("Serviço criado com sucesso");
  });

  it("deve propagar erro se o usuário não for admin", async () => {
    const mockCreateService = {
      execute: jest.fn().mockRejectedValue(new Error("Sem permissão")),
    };

    const controller = new CreateServiceController(mockCreateService as any);

    const req = mockRequest({
      user: { id: "barber-1" },
      body: {
        name: "Corte Tradicional",
        description: "Corte masculino tradicional",
        price: 35,
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req as any, res)).rejects.toThrow("Sem permissão");
  });
});
