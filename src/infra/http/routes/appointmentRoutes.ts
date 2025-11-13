import { Router } from "express";
import { CreateAppointment } from "../../../core/use-cases/CreateAppointment";
import { CreateAppointmentController } from "../controllers/appointments/CreateAppointmentController";
import { PrismaAppointmentRepository } from "../../database/repositories/PrismaAppointmentRepository";
import { AuthenticatedRequest, ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { PrismaClientRepository } from "../../database/repositories/PrismaClientRepository";
import { validate } from "../middlewares/validate";
import { CreateAppointmentSchema } from "../schemas/CreateAppointment.schema";
import { ListClientAppointmentsController } from "../controllers/appointments/ListClientAppointmentsController";
import { ListClientAppointments } from "../../../core/use-cases/ListClientAppointments";

Router()

const appointmentRoute = Router();
const appointmentRepo = new PrismaAppointmentRepository();
const clientRepository = new PrismaClientRepository();
const createAppointment = new CreateAppointment(appointmentRepo, clientRepository);
const createAppointmentController = new CreateAppointmentController(createAppointment);
const listClientAppointments = new ListClientAppointments(appointmentRepo, clientRepository);
const listClientAppointmentsController = new ListClientAppointmentsController(listClientAppointments);

appointmentRoute.post(
  "/create",
  ensureAuthenticated,
  validate(CreateAppointmentSchema),
  (req, res) => createAppointmentController.handle(req as AuthenticatedRequest, res)
);

appointmentRoute.get(
  "/client-appointments",
  ensureAuthenticated,
  async (req, res) => listClientAppointmentsController.handle(req as AuthenticatedRequest, res)
)

export { appointmentRoute };