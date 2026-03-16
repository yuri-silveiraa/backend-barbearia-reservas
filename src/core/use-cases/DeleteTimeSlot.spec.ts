import { DeleteTimeSlot } from "../../../core/use-cases/DeleteTimeSlot";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("DeleteTimeSlot", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new DeleteTimeSlot(timeRepository, barberRepository);

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

  it("deve deletar o horário", async () => {
    const timeSlots = await timeRepository.findByBarberId("barber-1");
    const timeSlotId = timeSlots![0].id;

    await sut.execute("barbeiro-user-1", timeSlotId);

    const result = await timeRepository.findByBarberId("barber-1");
    expect(result).toHaveLength(0);
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
