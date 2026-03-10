import { Router, Request } from "express";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { ensureBarber } from "../middlewares/ensureRole";
import { PrismaTimeRepository } from "../../database/repositories/PrismaTimeRepository";
import { validate } from "../middlewares/validate";
import { AuthenticatedRequest } from "../helpers/requestInterface";

import { GenerateTimeSlotsController } from "../controllers/times/GenerateTimeSlotsController";
import { GenerateTimeSlots } from "../../../core/use-cases/GenerateTimeSlots";
import { GenerateTimeSlotsSchema } from "../schemas/input/GenerateTimeSlots.schema";

import { ListMyTimeSlotsController } from "../controllers/times/ListMyTimeSlotsController";
import { ListMyTimeSlots } from "../../../core/use-cases/ListMyTimeSlots";

import { ListAvailableTimeSlotsController } from "../controllers/times/ListAvailableTimeSlotsController";
import { ListAvailableTimeSlots } from "../../../core/use-cases/ListAvailableTimeSlots";

import { DeleteTimeSlotController } from "../controllers/times/DeleteTimeSlotController";
import { DeleteTimeSlot } from "../../../core/use-cases/DeleteTimeSlot";

const timeRoutes = Router();

const timeRepo = new PrismaTimeRepository();
const barberRepo = new PrismaBarberRepository();

const generateTimeSlots = new GenerateTimeSlots(timeRepo, barberRepo);
const generateTimeSlotsController = new GenerateTimeSlotsController(generateTimeSlots);

const listMyTimeSlots = new ListMyTimeSlots(timeRepo, barberRepo);
const listMyTimeSlotsController = new ListMyTimeSlotsController(listMyTimeSlots);

const listAvailableTimeSlots = new ListAvailableTimeSlots(timeRepo);
const listAvailableTimeSlotsController = new ListAvailableTimeSlotsController(listAvailableTimeSlots);

const deleteTimeSlot = new DeleteTimeSlot(timeRepo, barberRepo);
const deleteTimeSlotController = new DeleteTimeSlotController(deleteTimeSlot);

timeRoutes.get(
  "/",
  (req, res) => listAvailableTimeSlotsController.handle(req as any, res)
);

timeRoutes.post(
  "/generate",
  ensureBarber,
  validate(GenerateTimeSlotsSchema),
  (req, res) => generateTimeSlotsController.handle(req as AuthenticatedRequest, res)
);

timeRoutes.get(
  "/my-times",
  ensureBarber,
  (req, res) => listMyTimeSlotsController.handle(req as AuthenticatedRequest, res)
);

timeRoutes.delete(
  "/:id",
  ensureBarber,
  (req, res) => deleteTimeSlotController.handle(req as AuthenticatedRequest, res)
);

export { timeRoutes };
