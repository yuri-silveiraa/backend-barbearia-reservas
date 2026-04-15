import { ChangeUserPasswordController } from "./ChangeUserPasswordController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ChangeUserPasswordController", () => {
  it("altera senha do usuário autenticado", async () => {
    const changeUserPassword = {
      execute: jest.fn().mockResolvedValue({
        id: "user-1",
        name: "Yuri",
        email: "yuri@example.com",
        password: "hashed",
        type: "CLIENT",
        telephone: "11999999999",
        createdAt: new Date(),
      }),
    };
    const controller = new ChangeUserPasswordController(changeUserPassword as any);
    const req = mockRequest({
      user: { id: "user-1" },
      body: {
        currentPassword: "Senha123",
        newPassword: "Nova123",
        confirmPassword: "Nova123",
      },
    });
    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(changeUserPassword.execute).toHaveBeenCalledWith({
      userId: "user-1",
      currentPassword: "Senha123",
      newPassword: "Nova123",
      confirmPassword: "Nova123",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Senha atualizada com sucesso",
      user: expect.objectContaining({ hasPassword: true }),
    }));
  });

  it("retorna 401 se usuário não estiver autenticado", async () => {
    const changeUserPassword = { execute: jest.fn() };
    const controller = new ChangeUserPasswordController(changeUserPassword as any);
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
    expect(changeUserPassword.execute).not.toHaveBeenCalled();
  });
});
