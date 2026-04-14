import { Router } from "express";
import { RegisterUserController } from "../controllers/users/RegisterUserController";
import { CreateUser } from "../../../core/use-cases/CreateUser";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository";
import { validate } from "../middlewares/validate";
import { CreateUserSchema } from "../schemas/input/CreateUser.schema";
import { LoginSchema } from "../schemas/input/Login.Schema";
import { AuthenticateUser } from "../../../core/use-cases/AuthenticateUser";
import { LoginUserController } from "../controllers/users/LoginUserController";
import { GetMeUserController } from "../controllers/users/GetMeUserController";
import { GetMeUser } from "../../../core/use-cases/getMeUser";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { getAuthCookieClearOptions } from "../helpers/authCookie";
import { GoogleAuthController } from "../controllers/users/GoogleAuthController";
import { VerifyEmailController } from "../controllers/users/VerifyEmailController";
import { VerifyEmail } from "../../../core/use-cases/VerifyEmail";
import { ResendEmailCodeController } from "../controllers/users/ResendEmailCodeController";
import { ResendEmailCode } from "../../../core/use-cases/ResendEmailCode";
import { UpdateUser } from "../../../core/use-cases/UpdateUser";
import { UpdateUserController } from "../controllers/users/UpdateUserController";
import { UpdateUserSchema } from "../schemas/input/UpdateUser.schema";
import { DeleteMeUser } from "../../../core/use-cases/DeleteMeUser";
import { DeleteMeUserController } from "../controllers/users/DeleteMeUserController";
import { PrismaClientRepository } from "../../database/repositories/PrismaClientRepository";
import { PrismaAppointmentRepository } from "../../database/repositories/PrismaAppointmentRepository";
import { PrismaTimeRepository } from "../../database/repositories/PrismaTimeRepository";
import { GetUserProfileImageController } from "../controllers/users/GetUserProfileImageController";

const userRoutes = Router();

const userRepo = new PrismaUsersRepository();

const createUser = new CreateUser(userRepo);
const registerController = new RegisterUserController(createUser);

const authenticateUser = new AuthenticateUser(userRepo);
const loginController = new LoginUserController(authenticateUser);

const getMeUser = new GetMeUser(userRepo);
const getMeUserController = new GetMeUserController(getMeUser);
const getUserProfileImageController = new GetUserProfileImageController(userRepo);

const googleAuthController = new GoogleAuthController();

const verifyEmail = new VerifyEmail(userRepo);
const verifyEmailController = new VerifyEmailController(verifyEmail);

const resendEmailCode = new ResendEmailCode(userRepo);
const resendEmailCodeController = new ResendEmailCodeController(resendEmailCode);

const updateUser = new UpdateUser(userRepo);
const updateUserController = new UpdateUserController(updateUser);

const clientRepo = new PrismaClientRepository();
const appointmentRepo = new PrismaAppointmentRepository();
const timeRepo = new PrismaTimeRepository();

const deleteMeUser = new DeleteMeUser(userRepo, clientRepo, appointmentRepo, timeRepo);
const deleteMeUserController = new DeleteMeUserController(deleteMeUser);

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

userRoutes.post(
  "/google",
  (req, res) => googleAuthController.handle(req, res)
);

userRoutes.post("/logout", (req, res) => {
  res.clearCookie('token', getAuthCookieClearOptions(req));
  return res.status(200).json({ message: "Logout realizado com sucesso" });
});

userRoutes.get(
  "/me", 
  ensureAuthenticated,
  (req, res) => getMeUserController.handle(req as AuthenticatedRequest, res)
);

userRoutes.get(
  "/:id/profile-image",
  ensureAuthenticated,
  (req, res) => getUserProfileImageController.handle(req, res)
);

userRoutes.patch(
  "/me",
  ensureAuthenticated,
  validate(UpdateUserSchema),
  (req, res) => updateUserController.handle(req as AuthenticatedRequest, res)
);

userRoutes.delete(
  "/me",
  ensureAuthenticated,
  (req, res) => deleteMeUserController.handle(req as AuthenticatedRequest, res)
);

userRoutes.post(
  "/verify-email",
  (req, res) => verifyEmailController.handle(req, res)
);

userRoutes.post(
  "/resend-code",
  (req, res) => resendEmailCodeController.handle(req, res)
);

export { userRoutes };
