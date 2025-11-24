import { Router } from "express";
import { CreateAppointment } from "../../../core/use-cases/CreateAppointment";
import { CreateAppointmentController } from "../controllers/appointments/CreateAppointmentController";
import { PrismaAppointmentRepository } from "../../database/repositories/PrismaAppointmentRepository";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { PrismaClientRepository } from "../../database/repositories/PrismaClientRepository";
import { validate } from "../middlewares/validate";
import { CreateAppointmentSchema } from "../schemas/input/CreateAppointment.schema";
import { ListClientAppointmentsController } from "../controllers/appointments/ListClientAppointmentsController";
import { ListClientAppointments } from "../../../core/use-cases/ListClientAppointments";
import { PrismaTimeRepository } from "../../database/repositories/PrismaTimeRepository";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AttendAppointment } from "../../../core/use-cases/AttendAppointment";
import { PrismaServiceRepository } from "../../database/repositories/PrismaServiceRepository";
import { AttendAppointmentController } from "../controllers/appointments/AttendAppointmentController";
import { PrismaBalanceRepository } from "../../database/repositories/PrismaBalanceRepository";
import { PrismaPaymentRepository } from "../../database/repositories/PrismaPaymentRepository";
import { CanceledAppointment } from "../../../core/use-cases/CanceledAppointment";
import { CanceledAppointmentController } from "../controllers/appointments/CanceledAppointmentController";

Router()

const appointmentRoute = Router();
const appointmentRepo = new PrismaAppointmentRepository();
const clientRepository = new PrismaClientRepository();
const timeRepo = new PrismaTimeRepository();
const barberRepo = new PrismaBarberRepository();
const paymentRepo = new PrismaPaymentRepository();
const serviceRepo = new PrismaServiceRepository();
const balanceRepo = new PrismaBalanceRepository();
const createAppointment = new CreateAppointment(appointmentRepo, clientRepository, timeRepo);
const createAppointmentController = new CreateAppointmentController(createAppointment);
const listClientAppointments = new ListClientAppointments(appointmentRepo, clientRepository);
const listClientAppointmentsController = new ListClientAppointmentsController(listClientAppointments);
const attendAppointment = new AttendAppointment(appointmentRepo, barberRepo, paymentRepo, serviceRepo, balanceRepo);
const canceledAppointment = new CanceledAppointment(appointmentRepo, clientRepository);
const attendAppointmentController = new AttendAppointmentController(attendAppointment);
const canceledAppointmentController = new CanceledAppointmentController(canceledAppointment);

appointmentRoute.use(ensureAuthenticated);

appointmentRoute.post(
  "/create",
  validate(CreateAppointmentSchema),
  (req, res) => createAppointmentController.handle(req as AuthenticatedRequest, res)
);

appointmentRoute.get(
  "/client-appointments",
  (req, res) => listClientAppointmentsController.handle(req as AuthenticatedRequest, res)
)

appointmentRoute.patch(
  "/attend/:id",
  (req, res) => attendAppointmentController.handle(req as unknown as AuthenticatedRequest, res)
);

appointmentRoute.patch(
  "/cancel/:id",
  (req, res) => canceledAppointmentController.handle(req as unknown as AuthenticatedRequest, res)
);

export { appointmentRoute };