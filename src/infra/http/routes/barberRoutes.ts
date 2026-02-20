import { Router } from "express";
import { ListBarber } from "../../../core/use-cases/ListBarber";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { ListBarberController } from "../controllers/barber/ListBarberController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureBarber, ensureAdmin } from "../middlewares/ensureRole";
import { ListBarberTodayAppointments } from "../../../core/use-cases/ListBarberTodayAppointments";
import { ListBarberTodayAppointmentsController } from "../controllers/barber/ListBarberTodayAppointmentsController";
import { GetBarberDailyStats } from "../../../core/use-cases/GetBarberDailyStats";
import { GetBarberDailyStatsController } from "../controllers/barber/GetBarberDailyStatsController";
import { PrismaAppointmentRepository } from "../../database/repositories/PrismaAppointmentRepository";
import { PrismaBalanceRepository } from "../../database/repositories/PrismaBalanceRepository";
import { CreateBarber } from "../../../core/use-cases/CreateBarber";
import { CreateBarberController } from "../controllers/barber/CreateBarberController";
import { DeleteBarberController } from "../controllers/barber/DeleteBarberController";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository";
import { AuthenticatedRequest } from "../helpers/requestInterface";

const barberRoutes = Router();

const barberRepo = new PrismaBarberRepository();
const appointmentRepo = new PrismaAppointmentRepository();
const balanceRepo = new PrismaBalanceRepository();
const userRepo = new PrismaUsersRepository();

const listBarber = new ListBarber(barberRepo);
const listBarberController = new ListBarberController(listBarber);

const listBarberTodayAppointments = new ListBarberTodayAppointments(appointmentRepo, barberRepo);
const listBarberTodayAppointmentsController = new ListBarberTodayAppointmentsController(listBarberTodayAppointments);

const getBarberDailyStats = new GetBarberDailyStats(appointmentRepo, barberRepo, balanceRepo);
const getBarberDailyStatsController = new GetBarberDailyStatsController(getBarberDailyStats);

const createBarber = new CreateBarber(userRepo, barberRepo, balanceRepo);
const createBarberController = new CreateBarberController(createBarber);

const deleteBarberController = new DeleteBarberController();

barberRoutes.get("/", (req, res) => listBarberController.handle(req, res));

barberRoutes.use(ensureAuthenticated);

barberRoutes.get(
  "/today-appointments",
  ensureBarber,
  (req, res) => listBarberTodayAppointmentsController.handle(req as AuthenticatedRequest, res)
);

barberRoutes.get(
  "/daily-stats",
  ensureBarber,
  (req, res) => getBarberDailyStatsController.handle(req as AuthenticatedRequest, res)
);

barberRoutes.post(
  "/",
  ensureAdmin,
  (req, res) => createBarberController.handle(req, res)
);

barberRoutes.delete(
  "/:id",
  ensureAdmin,
  (req, res) => deleteBarberController.handle(req as AuthenticatedRequest, res)
);

export { barberRoutes };
