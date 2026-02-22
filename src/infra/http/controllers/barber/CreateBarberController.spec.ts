import { CreateBarberController } from "./CreateBarberController";
import { CreateBarber } from "../../../../core/use-cases/CreateBarber";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("CreateBarberController", () => {
  it("deve criar um barbeiro com sucesso", async () => {
    const mockCreateBarber = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        name: "Carlos",
        email: "carlos@barbearia.com",
        password: "hashedpassword",
        type: "BARBER",
        createdAt: new Date(),
      }),
    };

    const controller = new CreateBarberController(mockCreateBarber as any);

    const req = mockRequest({
      body: {
        name: "Carlos",
        email: "carlos@barbearia.com",
        password: "123456",
        isAdmin: false,
      },
    });

    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockCreateBarber.execute).toHaveBeenCalledWith(
      {
        name: "Carlos",
        email: "carlos@barbearia.com",
        password: "123456",
        type: "BARBER",
      },
      false
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      user: expect.objectContaining({
        id: "1",
        name: "Carlos",
        email: "carlos@barbearia.com",
      }),
    });
  });

  it("deve criar um barbeiro admin quando isAdmin for true", async () => {
    const mockCreateBarber = {
      execute: jest.fn().mockResolvedValue({
        id: "2",
        name: "Admin",
        email: "admin@barbearia.com",
        password: "hashedpassword",
        type: "BARBER",
        createdAt: new Date(),
      }),
    };

    const controller = new CreateBarberController(mockCreateBarber as any);

    const req = mockRequest({
      body: {
        name: "Admin",
        email: "admin@barbearia.com",
        password: "123456",
        isAdmin: true,
      },
    });

    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockCreateBarber.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "BARBER",
      }),
      true
    );
  });

  it("deve retornar erro se os dados forem inválidos", async () => {
    const mockCreateBarber = {
      execute: jest.fn(),
    };

    const controller = new CreateBarberController(mockCreateBarber as any);

    const req = mockRequest({
      body: {
        name: "",
        email: "email-invalido",
        password: "123",
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req, res)).rejects.toThrow();
  });
});
