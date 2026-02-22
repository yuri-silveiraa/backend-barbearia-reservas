import { CreateService } from "./CreateService";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

describe("CreateService", () => {
  const serviceRepository = new FakeServiceRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new CreateService(serviceRepository, barberRepository);

  it("deve criar um serviço se o barbeiro for admin", async () => {
    await barberRepository.create({
      userId: "admin-user",
      isAdmin: true,
    });

    const data = {
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 35,
    };

    const service = await sut.execute(data, "admin-user");

    expect(service).toHaveProperty("id");
    expect(service.name).toBe(data.name);
    expect(service.price).toBe(data.price);
  });

  it("deve lançar erro se o barbeiro não for admin", async () => {
    await barberRepository.create({
      userId: "barber-user",
      isAdmin: false,
    });

    const data = {
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 35,
    };

    await expect(sut.execute(data, "barber-user")).rejects.toThrow(NoAuthorizationError);
  });
});
