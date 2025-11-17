import { Router } from "express";
import { CreateTimeController } from "../controllers/times/CreateTimeController";
import { CreateTime } from "../../../core/use-cases/CreateTime";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest, ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { PrismaTimeRepository } from "../../database/repositories/PrismaTimeRepository";
import { CreateTimeSchema } from "../schemas/CreateTime.schema";
import { validate } from "../middlewares/validate";

Router();

const timeRoutes = Router();

const timeRepo = new PrismaTimeRepository();
const barberRepo = new PrismaBarberRepository();
const createTime = new CreateTime(timeRepo, barberRepo);
const createTimeController = new CreateTimeController(createTime);

timeRoutes.post(
  "/create",
  validate(CreateTimeSchema),
  ensureAuthenticated,
  (req, res) => createTimeController.handle(req as AuthenticatedRequest, res)
);


export { timeRoutes };