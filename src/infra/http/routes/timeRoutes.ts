import { Router } from "express";
import { CreateTimeController } from "../controllers/times/CreateTimeController";
import { CreateTime } from "../../../core/use-cases/CreateTime";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest, ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { PrismaTimeRepository } from "../../database/repositories/PrismaTimeRepository";
import { CreateTimeSchema } from "../schemas/CreateTime.schema";
import { validate } from "../middlewares/validate";
import { ListTimeDisponibleController } from "../controllers/times/ListTimeDisponibleController";
import { ListTimeDisponible } from "../../../core/use-cases/ListTimeDisponible";

Router();

const timeRoutes = Router();

const timeRepo = new PrismaTimeRepository();
const barberRepo = new PrismaBarberRepository();
const createTime = new CreateTime(timeRepo, barberRepo);
const createTimeController = new CreateTimeController(createTime);
const listTimeDisponible = new ListTimeDisponible(timeRepo);
const listTimeDisponibleController = new ListTimeDisponibleController(listTimeDisponible);

timeRoutes.use(ensureAuthenticated);

timeRoutes.post(
  "/create",
  validate(CreateTimeSchema),
  (req, res) => createTimeController.handle(req as AuthenticatedRequest, res)
);

timeRoutes.get(
  "/:id",
  (req, res) => listTimeDisponibleController.handle(req , res)
)


export { timeRoutes };