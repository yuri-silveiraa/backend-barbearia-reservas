import { Request, Response, NextFunction } from "express";
import { ensureAuthenticated } from "../../infra/http/middlewares/ensureAuthenticated";
import { mockRequest, mockResponse } from "../utils/MockExpress";
import jwt from "jsonwebtoken";

jest.mock("../../config/env", () => ({
  env: {
    jwtSecret: "test_secret_key",
  },
}));

describe("ensureAuthenticated Middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });

  it("deve retornar 401 se o token não for fornecido", async () => {
    await ensureAuthenticated(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token não fornecido" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve retornar 401 se o token for inválido", async () => {
    req = mockRequest({ cookies: { token: "invalid_token" } });

    await ensureAuthenticated(req as any, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token inválido ou expirado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deve chamar next se o token for válido", async () => {
    const token = jwt.sign({ userId: "user-123" }, "test_secret_key", { expiresIn: "1h" });
    req = mockRequest({ cookies: { token } });

    await ensureAuthenticated(req as any, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toHaveProperty("id", "user-123");
  });
});
