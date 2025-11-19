import { response, Router } from "express";
import { CreateServiceController } from "../controllers/services/CreateServiceController";
import { CreateService } from "../../../core/use-cases/CreateService";
import { PrismaServiceRepository } from "../../database/repositories/PrismaServiceRepository";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { validate } from "../middlewares/validate";
import { CreateServiceSchema } from "../schemas/input/CreateService.schema";
import { ListService } from "../../../core/use-cases/ListService";
import { ListServiceController } from "../controllers/services/ListServiceController";

Router();

const serviceRoutes = Router();

const serviceRepo = new PrismaServiceRepository();
const barberRepo = new PrismaBarberRepository();
const createService = new CreateService(serviceRepo, barberRepo);
const listService = new ListService(serviceRepo);
const createServiceController = new CreateServiceController(createService);
const listServiceController = new ListServiceController(listService);

serviceRoutes.use(ensureAuthenticated);

serviceRoutes.post(
  "/create",
  validate(CreateServiceSchema),
  (req, res) => createServiceController.handle(req as AuthenticatedRequest, res)
);

serviceRoutes.get(
  "/",
  (req, res) => listServiceController.handle(res)
);

export { serviceRoutes };