import { ListBarberRevenueByRange } from "./ListBarberRevenueByRange";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListBarberRevenueByRange", () => {
  it("deve calcular faturamento usando o preço salvo no agendamento", async () => {
    const appointmentRepository = new FakeAppointmentRepository();
    const barberRepository = new FakeBarberRepository();
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const sut = new ListBarberRevenueByRange(barberRepository, appointmentRepository);

    const appointment = await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-1",
      serviceId: "service-1",
      timeId: "time-1",
      price: 70,
    });
    await appointmentRepository.attend(appointment.id);

    const result = await sut.execute(
      "barber-user-1",
      new Date("2026-04-10T03:00:00.000Z"),
      new Date("2026-04-11T02:59:59.999Z")
    );

    expect(result.totalRevenue).toBe(70);
    expect(result.appointments[0]).toEqual(expect.objectContaining({ amount: 70 }));
    expect(result.services[0]).toEqual(expect.objectContaining({ total: 70, count: 1 }));
  });
});
