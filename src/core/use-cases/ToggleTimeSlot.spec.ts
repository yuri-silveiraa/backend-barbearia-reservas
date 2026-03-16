import { ToggleTimeSlot } from "../../../core/use-cases/ToggleTimeSlot";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ToggleTimeSlot", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new ToggleTimeSlot(timeRepository, barberRepository);

  beforeEach(async () => {
    const barber = await barberRepository.create({
      userId: "barbeiro-user-1",
      isAdmin: false,
    });

    await timeRepository.create({
      barberId: barber.id,
      date: new Date("2026-03-10T08:00:00"),
    });
  });

  it("deve alternar disponibilidade do horário", async () => {
    const timeSlots = await timeRepository.findByBarberId("barber-1");
    const timeSlotId = timeSlots![0].id;

    const result = await sut.execute("barbeiro-user-1", timeSlotId);

    expect(result.disponible).toBe(false);
  });

  it("deve retornar erro se barbeiro não encontrado", async () => {
    await expect(
      sut.execute("non-existent-user", "time-1")
    ).rejects.toThrow("Barbeiro não encontrado");
  });

  it("deve retornar erro se horário não encontrado", async () => {
    await expect(
      sut.execute("barbeiro-user-1", "non-existent-time")
    ).rejects.toThrow("Horário não encontrado");
  });
});
