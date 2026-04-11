import { ListService } from "./ListService";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";

describe("ListService", () => {
  const serviceRepository = new FakeServiceRepository();
  const sut = new ListService(serviceRepository);

  it("deve retornar lista vazia se não houver serviços", async () => {
    const services = await sut.execute();
    expect(services).toEqual([]);
  });

  it("deve listar todos os serviços", async () => {
    await serviceRepository.create({
      name: "Corte Tradicional",
      description: "Corte masculino tradicional",
      price: 35,
      imageData: Buffer.from("fake-image"),
      imageMimeType: "image/jpeg",
    });

    await serviceRepository.create({
      name: "Barba",
      description: null as any,
      price: 30,
    });

    const services = await sut.execute();

    expect(services.length).toBe(2);
    expect(services[0].name).toBe("Corte Tradicional");
    expect(services[0].description).toBe("Corte masculino tradicional");
    expect(services[0].imageUrl).toMatch(/^\/api\/service\/1\/image\?v=\d+$/);
    expect(services[1].description).toBe("Sem descrição");
  });
});
