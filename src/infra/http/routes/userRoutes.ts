import { Router } from "express";
import { RegisterUserController } from "../controllers/users/RegisterUserController";
import { CreateUser } from "../../../core/use-cases/CreateUser";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository";
import { PrismaClientRepository } from "../../database/repositories/PrismaClientRepository";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { validate } from "../middlewares/validate";
import { CreateUserSchema } from "../schemas/CreateUser.schema";

Router();

const userRoutes = Router();


const barberRepo = new PrismaBarberRepository();
const clientRepo = new PrismaClientRepository();
const userRepo = new PrismaUsersRepository();
const createUser = new CreateUser(userRepo, barberRepo, clientRepo);
const controller = new RegisterUserController(createUser);

userRoutes.post(
  "/create",
  validate(CreateUserSchema),
  (req, res) => controller.handle(req, res)
);

export { userRoutes };