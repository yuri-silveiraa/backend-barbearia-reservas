import { Router } from "express";
import { ListBarber } from "../../../core/use-cases/ListBarber";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { ListBarberController } from "../controllers/barber/ListBarberController";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const barberRoutes = Router();

const barberRepo = new PrismaBarberRepository();
const listBarber = new ListBarber(barberRepo);
const listBarberController = new ListBarberController(listBarber);

barberRoutes.use(ensureAuthenticated);

barberRoutes.get("/", (req, res) => listBarberController.handle(req, res));

export { barberRoutes };
