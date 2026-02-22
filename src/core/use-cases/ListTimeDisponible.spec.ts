import { ListTimeDisponible } from "./ListTimeDisponible";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListTimeDisponible", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new ListTimeDisponible(timeRepository);

  it("deve retornar null se não houver horários", async () => {
    const barber = await barberRepository.create({ userId: "barber-1", isAdmin: false });

    const times = await sut.execute(barber.id);
    expect(times).toBeNull();
  });

  it("deve listar horários disponíveis do barbeiro", async () => {
    const barber = await barberRepository.create({ userId: "barber-2", isAdmin: false });

    await timeRepository.create({
      barberId: barber.id,
      date: new Date("2024-12-25T10:00:00"),
    });

    const times = await sut.execute(barber.id);

    expect(times).not.toBeNull();
    expect(times?.length).toBe(1);
  });
});
