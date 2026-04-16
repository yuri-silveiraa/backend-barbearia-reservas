import { CreateService } from "./CreateService";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("CreateService", () => {
  let serviceRepository: FakeServiceRepository;
  let barberRepository: FakeBarberRepository;
  let sut: CreateService;

  beforeEach(() => {
    serviceRepository = new FakeServiceRepository();
    barberRepository = new FakeBarberRepository();
    sut = new CreateService(serviceRepository, barberRepository);
  });

  it("deve criar um serviço próprio para um barbeiro ativo", async () => {
    const barber = await barberRepository.create({ userId: "barber-user", isAdmin: false });

    const data = {
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 35,
      durationMinutes: 45,
    };

    const service = await sut.execute(data, "barber-user");

    expect(service).toHaveProperty("id");
    expect(service.name).toBe(data.name);
    expect(service.price).toBe(data.price);
    expect(service.durationMinutes).toBe(45);
    expect(service.barberId).toBe(barber.id);
  });

  it("deve lançar erro se o barbeiro não existir", async () => {
    await expect(sut.execute({
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 35,
      durationMinutes: 45,
    }, "missing-user")).rejects.toThrow("Barbeiro não encontrado");
  });
});
