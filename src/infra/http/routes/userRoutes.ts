import { Router } from "express";
import { RegisterUserController } from "../controllers/users/RegisterUserController";
import { CreateUser } from "../../../core/use-cases/CreateUser";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository";
import { validate } from "../middlewares/validate";
import { CreateUserSchema } from "../schemas/input/CreateUser.schema";
import { LoginSchema } from "../schemas/input/Login.Schema";
import { AuthenticateUser } from "../../../core/use-cases/AuthenticateUser";
import { LoginUserController } from "../controllers/users/LoginUserController";

const userRoutes = Router();

const userRepo = new PrismaUsersRepository();

const createUser = new CreateUser(userRepo);
const registerController = new RegisterUserController(createUser);

const authenticateUser = new AuthenticateUser(userRepo);
const loginController = new LoginUserController(authenticateUser);

userRoutes.post(
  "/create",
  validate(CreateUserSchema),
  (req, res) => registerController.handle(req, res)
);

userRoutes.post(
  "/login",
  validate(LoginSchema),
  (req, res) => loginController.handle(req, res)
);

userRoutes.post("/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.status(200).json({ message: "Logout realizado com sucesso" });
});

export { userRoutes };