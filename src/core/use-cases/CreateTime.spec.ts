import { CreateTime } from "./CreateTime";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("CreateTime", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new CreateTime(timeRepository, barberRepository);

  it("deve criar um horário para o barbeiro", async () => {
    await barberRepository.create({
      userId: "barber-user-1",
      isAdmin: false,
    });

    const data = {
      barberId: "barber-user-1",
      date: new Date("2024-12-25T10:00:00"),
    };

    const time = await sut.execute(data);

    expect(time).toHaveProperty("id");
    expect(time.barberId).toBe("1");
    expect(time.disponible).toBe(true);
  });
});
