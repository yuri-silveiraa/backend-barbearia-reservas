import { ListBarberTodayAppointments } from "./ListBarberTodayAppointments";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListBarberTodayAppointments", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const barberRepository = new FakeBarberRepository();
  const sut = new ListBarberTodayAppointments(appointmentRepository, barberRepository);

  it("deve lançar erro se o barbeiro não existir", async () => {
    await expect(sut.execute("non-existent-user")).rejects.toThrow("Barbeiro não encontrado");
  });

  it("deve retornar agendamentos do barbeiro", async () => {
    const barber = await barberRepository.create({
      userId: "user-1",
      isAdmin: false,
    });

    const appointments = await sut.execute("user-1");

    expect(Array.isArray(appointments)).toBe(true);
  });
});
