import { DeleteTimeSlot } from "./DeleteTimeSlot";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("DeleteTimeSlot", () => {
  let timeRepository: FakeTimeRepository;
  let barberRepository: FakeBarberRepository;
  let sut: DeleteTimeSlot;
  let barberId = "";

  beforeEach(async () => {
    timeRepository = new FakeTimeRepository();
    barberRepository = new FakeBarberRepository();
    sut = new DeleteTimeSlot(timeRepository, barberRepository);

    const barber = await barberRepository.create({
      userId: "barbeiro-user-1",
      isAdmin: false,
    });
    barberId = barber.id;
  });

  it("deve deletar fisicamente o horário", async () => {
    const time = await timeRepository.create({
      barberId,
      date: new Date("2030-04-10T08:00:00"),
    });

    await sut.execute("barbeiro-user-1", time.id);

    await expect(timeRepository.findById(time.id)).resolves.toBeNull();
  });

  it("deve deletar fisicamente mesmo se o horário estiver indisponível", async () => {
    const time = await timeRepository.create({
      barberId,
      date: new Date("2030-04-10T08:00:00"),
    });
    await timeRepository.updateDisponible(time.id, false);

    await sut.execute("barbeiro-user-1", time.id);

    await expect(timeRepository.findById(time.id)).resolves.toBeNull();
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

  it("deve impedir excluir horário de outro barbeiro", async () => {
    const otherBarber = await barberRepository.create({
      userId: "barbeiro-user-2",
      isAdmin: false,
    });
    const time = await timeRepository.create({
      barberId: otherBarber.id,
      date: new Date("2030-04-10T08:00:00"),
    });

    await expect(
      sut.execute("barbeiro-user-1", time.id)
    ).rejects.toThrow("Você não tem permissão para excluir este horário");
  });
});
