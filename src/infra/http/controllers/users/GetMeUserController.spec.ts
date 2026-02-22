import { GetMeUserController } from "./GetMeUserController";
import { GetMeUser } from "../../../../core/use-cases/getMeUser";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("GetMeUserController", () => {
  it("deve retornar o usuário logado", async () => {
    const mockGetMeUser = {
      execute: jest.fn().mockResolvedValue({
        id: "1",
        name: "Yuri",
        email: "yuri@teste.com",
        type: "CLIENT",
        createdAt: new Date(),
      }),
    };

    const controller = new GetMeUserController(mockGetMeUser as any);

    const req = mockRequest({
      user: { id: "1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(mockGetMeUser.execute).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "1",
      name: "Yuri",
      email: "yuri@teste.com",
      type: "CLIENT",
      createdAt: expect.any(Date),
    });
  });

  it("deve retornar 401 se o usuário não estiver autenticado", async () => {
    const mockGetMeUser = {
      execute: jest.fn(),
    };

    const controller = new GetMeUserController(mockGetMeUser as any);

    const req = mockRequest({
      user: undefined,
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuário não autenticado" });
    expect(mockGetMeUser.execute).not.toHaveBeenCalled();
  });
});
