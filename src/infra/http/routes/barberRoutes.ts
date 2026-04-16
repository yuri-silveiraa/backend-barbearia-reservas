import { Router } from "express";
import { ListBarber } from "../../../core/use-cases/ListBarber";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { ListBarberController } from "../controllers/barber/ListBarberController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureBarber, ensureAdmin } from "../middlewares/ensureRole";
import { ListBarberTodayAppointments } from "../../../core/use-cases/ListBarberTodayAppointments";
import { ListBarberTodayAppointmentsController } from "../controllers/barber/ListBarberTodayAppointmentsController";
import { ListBarberAppointmentsByRange } from "../../../core/use-cases/ListBarberAppointmentsByRange";
import { ListBarberAppointmentsByRangeController } from "../controllers/barber/ListBarberAppointmentsByRangeController";
import { GetBarberDailyStats } from "../../../core/use-cases/GetBarberDailyStats";
import { GetBarberDailyStatsController } from "../controllers/barber/GetBarberDailyStatsController";
import { PrismaAppointmentRepository } from "../../database/repositories/PrismaAppointmentRepository";
import { CreateBarber } from "../../../core/use-cases/CreateBarber";
import { CreateBarberController } from "../controllers/barber/CreateBarberController";
import { DeleteBarberController } from "../controllers/barber/DeleteBarberController";
import { PrismaUsersRepository } from "../../database/repositories/PrismaUsersRepository";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { ListBarberRevenueByRange } from "../../../core/use-cases/ListBarberRevenueByRange";
import { ListBarberRevenueByRangeController } from "../controllers/barber/ListBarberRevenueByRangeController";
import { CreateManualAppointment } from "../../../core/use-cases/CreateManualAppointment";
import { CreateManualAppointmentController } from "../controllers/barber/CreateManualAppointmentController";
import { PrismaCustomerRepository } from "../../database/repositories/PrismaCustomerRepository";
import { validate } from "../middlewares/validate";
import { CreateManualAppointmentSchema } from "../schemas/input/CreateManualAppointment.schema";
import { appointmentRateLimiter } from "../middlewares/rateLimit";

const barberRoutes = Router();

const barberRepo = new PrismaBarberRepository();
const appointmentRepo = new PrismaAppointmentRepository();
const userRepo = new PrismaUsersRepository();
const customerRepo = new PrismaCustomerRepository();

const listBarber = new ListBarber(barberRepo);
const listBarberController = new ListBarberController(listBarber);

const listBarberTodayAppointments = new ListBarberTodayAppointments(appointmentRepo, barberRepo);
const listBarberTodayAppointmentsController = new ListBarberTodayAppointmentsController(listBarberTodayAppointments);

const listBarberAppointmentsByRange = new ListBarberAppointmentsByRange(appointmentRepo, barberRepo);
const listBarberAppointmentsByRangeController = new ListBarberAppointmentsByRangeController(listBarberAppointmentsByRange);

const getBarberDailyStats = new GetBarberDailyStats(appointmentRepo, barberRepo);
const getBarberDailyStatsController = new GetBarberDailyStatsController(getBarberDailyStats);

const listBarberRevenueByRange = new ListBarberRevenueByRange(barberRepo, appointmentRepo);
const listBarberRevenueByRangeController = new ListBarberRevenueByRangeController(listBarberRevenueByRange);

const createManualAppointment = new CreateManualAppointment(appointmentRepo, barberRepo, customerRepo);
const createManualAppointmentController = new CreateManualAppointmentController(createManualAppointment);

const createBarber = new CreateBarber(userRepo, barberRepo);
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
  "/appointments",
  ensureBarber,
  (req, res) => listBarberAppointmentsByRangeController.handle(req as AuthenticatedRequest, res)
);

barberRoutes.get(
  "/daily-stats",
  ensureBarber,
  (req, res) => getBarberDailyStatsController.handle(req as AuthenticatedRequest, res)
);

barberRoutes.get(
  "/revenue",
  ensureBarber,
  (req, res) => listBarberRevenueByRangeController.handle(req as AuthenticatedRequest, res)
);

barberRoutes.post(
  "/appointments/manual",
  ensureBarber,
  appointmentRateLimiter,
  validate(CreateManualAppointmentSchema),
  (req, res) => createManualAppointmentController.handle(req as AuthenticatedRequest, res)
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
