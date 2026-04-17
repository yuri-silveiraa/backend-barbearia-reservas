import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";
import { UpdateService } from "./UpdateService";

describe("UpdateService", () => {
  let serviceRepository: FakeServiceRepository;
  let barberRepository: FakeBarberRepository;
  let sut: UpdateService;

  beforeEach(() => {
    serviceRepository = new FakeServiceRepository();
    barberRepository = new FakeBarberRepository();
    sut = new UpdateService(serviceRepository, barberRepository);
  });

  it("deve atualizar duração válida do serviço do barbeiro", async () => {
    const barber = await barberRepository.create({ userId: "barber-user", isAdmin: false });
    const service = await serviceRepository.create({ barberId: barber.id, name: "Corte", price: 40, durationMinutes: 30 });

    const updated = await sut.execute({
      id: service.id,
      barberUserId: "barber-user",
      durationMinutes: 45,
    });

    expect(updated.durationMinutes).toBe(45);
  });

  it("deve bloquear atualização com duração menor que 15 minutos", async () => {
    const barber = await barberRepository.create({ userId: "barber-user", isAdmin: false });
    const service = await serviceRepository.create({ barberId: barber.id, name: "Corte", price: 40, durationMinutes: 30 });

    await expect(sut.execute({
      id: service.id,
      barberUserId: "barber-user",
      durationMinutes: 10,
    })).rejects.toThrow("Duração mínima é 15 minutos");
  });
});
