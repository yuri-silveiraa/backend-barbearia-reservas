import { response, Router } from "express";
import { CreateServiceController } from "../controllers/services/CreateServiceController";
import { CreateService } from "../../../core/use-cases/CreateService";
import { PrismaServiceRepository } from "../../database/repositories/PrismaServiceRepository";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { ensureAdmin } from "../middlewares/ensureRole";
import { validate } from "../middlewares/validate";
import { CreateServiceSchema } from "../schemas/input/CreateService.schema";
import { ListService } from "../../../core/use-cases/ListService";
import { ListServiceController } from "../controllers/services/ListServiceController";
import { UpdateServiceController } from "../controllers/services/UpdateServiceController";
import { UpdateService } from "../../../core/use-cases/UpdateService";

Router();

const serviceRoutes = Router();

const serviceRepo = new PrismaServiceRepository();
const barberRepo = new PrismaBarberRepository();
const createService = new CreateService(serviceRepo, barberRepo);
const listService = new ListService(serviceRepo);
const updateService = new UpdateService(serviceRepo);
const createServiceController = new CreateServiceController(createService);
const listServiceController = new ListServiceController(listService);
const updateServiceController = new UpdateServiceController(updateService);

serviceRoutes.post(
  "/create",
  ensureAuthenticated,
  ensureAdmin,
  validate(CreateServiceSchema),
  (req, res) => createServiceController.handle(req as AuthenticatedRequest, res)
);

serviceRoutes.get(
  "/",
  (req, res) => listServiceController.handle(res)
);

serviceRoutes.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  (req, res) => updateServiceController.handle(req as AuthenticatedRequest, res)
);

serviceRoutes.delete(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    return serviceRepo.deleteById(id)
      .then(() => res.status(204).send())
      .catch((error) => res.status(400).json({ message: error.message }));
  }
);

export { serviceRoutes };
