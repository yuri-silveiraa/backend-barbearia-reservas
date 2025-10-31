import { Request, Response } from "express";
import { AuthenticateUser } from "../../../../core/use-cases/AuthenticateUser";
import { LoginUserController } from "./LoginUserController";
import dotenv from 'dotenv';

dotenv.config()

describe('LoginUserController', () => {
  it('deve autenticar um usuário e retornar um token JWT', async () => {
    const mockAuthenticateUser = {
      execute: jest.fn().mockResolvedValue({ id: 'user-id-123' }),
    } as Partial<AuthenticateUser>;

    const controller = new LoginUserController(
      mockAuthenticateUser as unknown as AuthenticateUser
    );
    const req2: Request = {
      body: {
        email: 'yuri@teste.com',
        password: '123456',
      }
    } as Request;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as unknown as Response;

    await controller.handle(req2 , res);

    expect(mockAuthenticateUser.execute).toHaveBeenCalledWith({
      email: 'yuri@teste.com',
      password: '123456',
    });

    expect(res.json).toHaveBeenCalledWith({
      token: expect.any(String),
    });
  });
});