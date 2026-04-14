import { ListBarberController } from "./ListBarberController";
import { ListBarber } from "../../../../core/use-cases/ListBarber";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

describe("ListBarberController", () => {
  it("deve listar todos os barbeiros", async () => {
    const mockListBarber = {
      execute: jest.fn().mockResolvedValue([
        {
          id: "1",
          userId: "user-1",
          name: "Carlos",
          profileImageUrl: null,
          isAdmin: false,
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: "2",
          userId: "user-2",
          name: "Admin",
          profileImageUrl: "/api/user/user-2/profile-image?v=1",
          isAdmin: true,
          isActive: true,
          createdAt: new Date(),
        },
      ]),
    };

    const controller = new ListBarberController(mockListBarber as any);

    const req = mockRequest();
    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockListBarber.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ nome: "Carlos" }),
      expect.objectContaining({ nome: "Admin" }),
    ]));
  });

  it("deve retornar lista vazia se não houver barbeiros", async () => {
    const mockListBarber = {
      execute: jest.fn().mockResolvedValue([]),
    };

    const controller = new ListBarberController(mockListBarber as any);

    const req = mockRequest();
    const res = mockResponse();

    await controller.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
