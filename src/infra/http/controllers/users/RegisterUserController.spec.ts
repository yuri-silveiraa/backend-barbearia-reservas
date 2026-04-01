import { RegisterUserController } from "./RegisterUserController";
import { CreateUser } from "../../../../core/use-cases/CreateUser";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("RegisterUserController", () => {
  it("deve registrar um novo usuário cliente e retornar dados sem senha", async () => {
    const mockCreateUser = {
      execute: jest.fn().mockResolvedValue({
        user: {
          id: "1",
          name: "Yuri",
          email: "yuri@teste.com",
          password: "hashedpassword",
          type: "CLIENT",
          emailVerified: false,
          createdAt: new Date(),
        },
        code: "123456",
      }),
    };

    const controller = new RegisterUserController(mockCreateUser as any);

    const req = mockRequest({
      body: {
        name: "Yuri",
        email: "yuri@teste.com",
        password: "123456",
      },
    });

    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockCreateUser.execute).toHaveBeenCalledWith({
      name: "Yuri",
      email: "yuri@teste.com",
      password: "123456",
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      name: "Yuri",
      email: "yuri@teste.com",
      emailVerified: false,
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
      },
    });

    const res = mockResponse();

    await expect(controller.handle(req, res)).rejects.toThrow("Email já existe");
  });
});
