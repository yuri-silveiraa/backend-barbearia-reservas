import { Router } from "express";
import { CreateServiceController } from "../controllers/services/CreateServiceController";
import { CreateService } from "../../../core/use-cases/CreateService";
import { PrismaServiceRepository } from "../../database/repositories/PrismaServiceRepository";
import { PrismaBarberRepository } from "../../database/repositories/PrismaBarberReposiry";
import { AuthenticatedRequest } from "../helpers/requestInterface";
import { ensureBarber } from "../middlewares/ensureRole";
import { validate } from "../middlewares/validate";
import { CreateServiceSchema } from "../schemas/input/CreateService.schema";
import { ListService } from "../../../core/use-cases/ListService";
import { ListServiceController } from "../controllers/services/ListServiceController";
import { UpdateServiceController } from "../controllers/services/UpdateServiceController";
import { UpdateService } from "../../../core/use-cases/UpdateService";
import { GetServiceImageController } from "../controllers/services/GetServiceImageController";

Router();

const serviceRoutes = Router();

const serviceRepo = new PrismaServiceRepository();
const barberRepo = new PrismaBarberRepository();
const createService = new CreateService(serviceRepo, barberRepo);
const listService = new ListService(serviceRepo);
const updateService = new UpdateService(serviceRepo, barberRepo);
const createServiceController = new CreateServiceController(createService);
const listServiceController = new ListServiceController(listService);
const updateServiceController = new UpdateServiceController(updateService);
const getServiceImageController = new GetServiceImageController(serviceRepo);

serviceRoutes.post(
  "/create",
  ensureBarber,
  validate(CreateServiceSchema),
  (req, res) => createServiceController.handle(req as AuthenticatedRequest, res)
);

serviceRoutes.get(
  "/",
  (req, res) => listServiceController.handle(req, res)
);

serviceRoutes.get(
  "/my-services",
  ensureBarber,
  async (req, res) => {
    try {
      const barberId = (req as AuthenticatedRequest).user.barberId;
      const services = await listService.execute(barberId);
      return res.status(200).json(services.map((service) => ({
        id: service.id,
        barberId: service.barberId,
        nome: service.name,
        name: service.name,
        preço: service.price,
        price: service.price,
        duration: service.durationMinutes,
        durationMinutes: service.durationMinutes,
        descrição: service.description,
        description: service.description,
        imagemUrl: service.imageUrl,
        imageUrl: service.imageUrl,
      })));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar serviços";
      return res.status(400).json({ message });
    }
  }
);

serviceRoutes.get(
  "/:id/image",
  (req, res) => getServiceImageController.handle(req, res)
);

serviceRoutes.put(
  "/:id",
  ensureBarber,
  (req, res) => updateServiceController.handle(req as AuthenticatedRequest, res)
);

serviceRoutes.delete(
  "/:id",
  ensureBarber,
  async (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    try {
      const barber = await barberRepo.findByUserId((req as AuthenticatedRequest).user.id);
      const service = await serviceRepo.findById(id);
      if (!barber || !service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      if (service.barberId !== barber.id) {
        return res.status(403).json({ message: "Serviço não pertence ao barbeiro autenticado" });
      }

      await serviceRepo.deleteById(id);
      return res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir serviço";
      return res.status(400).json({ message });
    }
  }
);

export { serviceRoutes };
