import { Request, Response, NextFunction } from "express";
import { ensureBarber, ensureAdmin } from "../../infra/http/middlewares/ensureRole";
import { mockRequest, mockResponse } from "../utils/MockExpress";
import jwt from "jsonwebtoken";
import { PrismaBarberRepository } from "../../infra/database/repositories/PrismaBarberReposiry";

jest.mock("../../config/env", () => ({
  env: {
    jwtSecret: "test_secret_key",
  },
}));

jest.mock("../../infra/database/repositories/PrismaBarberReposiry");

describe("ensureRole Middlewares", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  describe("ensureBarber", () => {
    it("deve retornar 401 se o token não for fornecido", async () => {
      await ensureBarber(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Token não fornecido" });
    });

    it("deve retornar 403 se o usuário não for barbeiro", async () => {
      const token = jwt.sign({ userId: "user-123" }, "test_secret_key", { expiresIn: "1h" });
      req = mockRequest({ cookies: { token } });

      (PrismaBarberRepository as jest.Mock).mockImplementation(() => ({
        findByUserId: jest.fn().mockResolvedValue(null),
      }));

      await ensureBarber(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("deve chamar next se o usuário for barbeiro", async () => {
      const token = jwt.sign({ userId: "user-123" }, "test_secret_key", { expiresIn: "1h" });
      req = mockRequest({ cookies: { token } });

      (PrismaBarberRepository as jest.Mock).mockImplementation(() => ({
        findByUserId: jest.fn().mockResolvedValue({
          id: "barber-1",
          userId: "user-123",
          isAdmin: false,
          isActive: true,
          createdAt: new Date(),
        }),
      }));

      await ensureBarber(req as any, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("ensureAdmin", () => {
    it("deve retornar 403 se não for admin", async () => {
      const token = jwt.sign({ userId: "user-123" }, "test_secret_key", { expiresIn: "1h" });
      req = mockRequest({ cookies: { token } });

      (PrismaBarberRepository as jest.Mock).mockImplementation(() => ({
        findByUserId: jest.fn().mockResolvedValue({
          id: "barber-1",
          userId: "user-123",
          isAdmin: false,
          isActive: true,
          createdAt: new Date(),
        }),
      }));

      await ensureAdmin(req as any, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("deve chamar next se for admin", async () => {
      const token = jwt.sign({ userId: "user-123" }, "test_secret_key", { expiresIn: "1h" });
      req = mockRequest({ cookies: { token } });

      (PrismaBarberRepository as jest.Mock).mockImplementation(() => ({
        findByUserId: jest.fn().mockResolvedValue({
          id: "barber-1",
          userId: "user-123",
          isAdmin: true,
          isActive: true,
          createdAt: new Date(),
        }),
      }));

      await ensureAdmin(req as any, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
