import { Request, Response } from "express";
import { AuthenticateUser } from "../../../../core/use-cases/AuthenticateUser";
import { LoginUserController } from "./LoginUserController";
import dotenv from 'dotenv';
import { mockRequest, mockResponse } from "../../../../tests/utils/MockExpress";

dotenv.config()

describe('LoginUserController', () => {
  it('deve autenticar um usuário e retornar um token JWT', async () => {
    const mockAuthenticateUser = {
      execute: jest.fn().mockResolvedValue({
        id: "123",
        email: "yuri@teste.com",
        password: "hashed",
        name: "Yuri",
        type: "BARBER",
        createdAt: new Date()
      }),
    };

    process.env.JWT_SECRET = "test_secret";

    const controller = new LoginUserController(
      mockAuthenticateUser as any
    );

    const req = mockRequest({
      body: {
        email: "yuri@teste.com",
        password: "123456"
      }
    });

    const res = mockResponse();

    await controller.handle(req, res);

    expect(mockAuthenticateUser.execute).toHaveBeenCalledWith({
      email: "yuri@teste.com",
      password: "123456"
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: expect.any(String)
    });
  });
});