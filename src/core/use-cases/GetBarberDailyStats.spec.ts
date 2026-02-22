import { GetBarberDailyStats } from "./GetBarberDailyStats";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeBalanceRepository } from "../../tests/repositories/FakeBalanceRepository";

describe("GetBarberDailyStats", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const barberRepository = new FakeBarberRepository();
  const balanceRepository = new FakeBalanceRepository();
  const sut = new GetBarberDailyStats(appointmentRepository, barberRepository, balanceRepository);

  it("deve lançar erro se o barbeiro não existir", async () => {
    await expect(sut.execute("non-existent-user")).rejects.toThrow("Barbeiro não encontrado");
  });

  it("deve retornar estatísticas do dia do barbeiro", async () => {
    const barber = await barberRepository.create({
      userId: "user-1",
      isAdmin: false,
    });

    await balanceRepository.create({ barberId: barber.id });

    const stats = await sut.execute("user-1");

    expect(stats).toHaveProperty("completedCount");
    expect(stats).toHaveProperty("scheduledCount");
    expect(stats).toHaveProperty("totalRevenue");
    expect(stats.completedCount).toBe(0);
    expect(stats.scheduledCount).toBe(0);
    expect(stats.totalRevenue).toBe(0);
  });
});
