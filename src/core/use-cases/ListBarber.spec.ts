import { ListBarber } from "./ListBarber";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListBarber", () => {
  const barberRepository = new FakeBarberRepository();
  const sut = new ListBarber(barberRepository);

  it("deve retornar lista vazia se não houver barbeiros", async () => {
    const barbers = await sut.execute();
    expect(barbers).toEqual([]);
  });

  it("deve listar todos os barbeiros ativos", async () => {
    await barberRepository.create({ userId: "user-1", isAdmin: false });
    await barberRepository.create({ userId: "user-2", isAdmin: true });

    const barbers = await sut.execute();

    expect(barbers.length).toBe(2);
  });
});
