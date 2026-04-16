import { CreateTime } from "./CreateTime";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("CreateTime", () => {
  const timeRepository = new FakeTimeRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new CreateTime(timeRepository, barberRepository);

  it("deve criar uma jornada para o barbeiro", async () => {
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });

    const time = await sut.execute({
      barberId: "barber-user-1",
      startAt: new Date("2030-04-10T08:00:00.000Z"),
      endAt: new Date("2030-04-10T18:00:00.000Z"),
      breakStartAt: new Date("2030-04-10T12:00:00.000Z"),
      breakEndAt: new Date("2030-04-10T12:30:00.000Z"),
    });

    expect(time).toHaveProperty("id");
    expect(time.barberId).toBe("1");
    expect(time.startAt).toEqual(new Date("2030-04-10T08:00:00.000Z"));
    expect(time.endAt).toEqual(new Date("2030-04-10T18:00:00.000Z"));
    expect(time.breakStartAt).toEqual(new Date("2030-04-10T12:00:00.000Z"));
  });
});
