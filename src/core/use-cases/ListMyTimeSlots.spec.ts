import { ListMyTimeSlots } from "../../../core/use-cases/ListMyTimeSlots";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListMyTimeSlots", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new ListMyTimeSlots(timeRepository, barberRepository);

  beforeEach(async () => {
    const barber = await barberRepository.create({
      userId: "barbeiro-user-1",
      isAdmin: false,
    });

    await timeRepository.create({
      barberId: barber.id,
      date: new Date("2026-03-10T08:00:00"),
    });

    await timeRepository.create({
      barberId: barber.id,
      date: new Date("2026-03-10T09:00:00"),
    });
  });

  it("deve listar todos os horários do barbeiro", async () => {
    const result = await sut.execute("barbeiro-user-1");

    expect(result).toHaveLength(2);
  });

  it("deve retornar erro se barbeiro não encontrado", async () => {
    await expect(sut.execute("non-existent-user")).rejects.toThrow(
      "Barbeiro não encontrado"
    );
  });

  it("deve retornar array vazio se não houver horários", async () => {
    const result = await sut.execute("barbeiro-user-2");

    expect(result).toEqual([]);
  });
});
