import { DeleteBarberController } from "./DeleteBarberController";
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

jest.mock("../../../database/repositories/PrismaBarberReposiry", () => {
  const mockFindByUserId = jest.fn();
  const mockDismiss = jest.fn();

  return {
    PrismaBarberRepository: jest.fn().mockImplementation(() => ({
      findByUserId: mockFindByUserId,
      dismiss: mockDismiss,
    })),
    __mockFindByUserId: mockFindByUserId,
    __mockDismiss: mockDismiss,
  };
});

describe("DeleteBarberController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve desativar um barbeiro com sucesso", async () => {
    const { PrismaBarberRepository, __mockFindByUserId, __mockDismiss } = 
      require("../../../database/repositories/PrismaBarberReposiry");
    
    __mockFindByUserId.mockResolvedValue({
      id: "barber-1",
      userId: "user-1",
      isAdmin: false,
      isActive: true,
      createdAt: new Date(),
    });
    __mockDismiss.mockResolvedValue(undefined);

    const controller = new DeleteBarberController();

    const req = mockRequest({
      params: { id: "user-1" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Barbeiro desativado com sucesso" });
  });

  it("deve retornar 404 se o barbeiro não existir", async () => {
    const { __mockFindByUserId } = require("../../../database/repositories/PrismaBarberReposiry");
    
    __mockFindByUserId.mockResolvedValue(null);

    const controller = new DeleteBarberController();

    const req = mockRequest({
      params: { id: "non-existent" },
    });

    const res = mockResponse();

    await controller.handle(req as any, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Barbeiro não encontrado" });
  });
});
