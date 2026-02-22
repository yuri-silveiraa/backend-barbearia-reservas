import { RegisterUserController } from "./RegisterUserController";
import { CreateUser } from "../../../../core/use-cases/CreateUser";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("RegisterUserController", () => {
  it("deve registrar um novo usuário e retornar dados sem senha", async () => {
    const mockCreateUser = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        name: "Yuri",
        email: "yuri@teste.com",
        password: "hashedpassword",
        type: "CLIENT",
        createdAt: new Date(),
      }),
    };

    const controller = new RegisterUserController(mockCreateUser as any);

    const req = mockRequest({
      body: {
        name: "Yuri",
        email: "yuri@teste.com",
        password: "123456",
        type: "CLIENT",
      },
    });

    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockCreateUser.execute).toHaveBeenCalledWith({
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
      type: "CLIENT",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      name: "Yuri",
      email: "yuri@teste.com",
    });
  });

  it("deve propagar erro se o email já existir", async () => {
    const mockCreateUser = {
      execute: jest.fn().mockRejectedValue(new Error("Email já existe")),
    };

    const controller = new RegisterUserController(mockCreateUser as any);

    const req = mockRequest({
      body: {
        name: "Yuri",
        email: "yuri@teste.com",
        password: "123456",
        type: "CLIENT",
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req, res)).rejects.toThrow("Email já existe");
  });
});
