import { ListBarberAppointmentsByRange } from "./ListBarberAppointmentsByRange";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";

describe("ListBarberAppointmentsByRange", () => {
  it("deve manter o comportamento sem serviceId retornando agendamentos do barbeiro no período", async () => {
    const appointmentRepository = new FakeAppointmentRepository();
    const barberRepository = new FakeBarberRepository();
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const otherBarber = await barberRepository.create({ userId: "barber-user-2", isAdmin: false });
    const sut = new ListBarberAppointmentsByRange(appointmentRepository, barberRepository);

    await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-1",
      serviceId: "service-1",
      timeId: "time-1",
      price: 70,
    });
    await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-2",
      serviceId: "service-2",
      timeId: "time-2",
      price: 90,
    });
    await appointmentRepository.create({
      barberId: otherBarber.id,
      clientId: "client-3",
      serviceId: "service-1",
      timeId: "time-3",
      price: 110,
    });

    const result = await sut.execute(
      "barber-user-1",
      new Date("2000-01-01T00:00:00.000Z"),
      new Date("2100-01-01T00:00:00.000Z")
    );

    expect(result).toHaveLength(2);
    expect(result.every((appointment) => appointment.barberId === barber.id)).toBe(true);
  });

  it("deve retornar apenas agendamentos do serviço informado sem acessar outro barbeiro", async () => {
    const appointmentRepository = new FakeAppointmentRepository();
    const barberRepository = new FakeBarberRepository();
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const otherBarber = await barberRepository.create({ userId: "barber-user-2", isAdmin: false });
    const sut = new ListBarberAppointmentsByRange(appointmentRepository, barberRepository);

    await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-1",
      serviceId: "service-1",
      timeId: "time-1",
      price: 70,
    });
    await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-2",
      serviceId: "service-2",
      timeId: "time-2",
      price: 90,
    });
    await appointmentRepository.create({
      barberId: otherBarber.id,
      clientId: "client-3",
      serviceId: "service-1",
      timeId: "time-3",
      price: 110,
    });

    const result = await sut.execute(
      "barber-user-1",
      new Date("2000-01-01T00:00:00.000Z"),
      new Date("2100-01-01T00:00:00.000Z"),
      "service-1"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({ barberId: barber.id, serviceId: "service-1" }));
  });
});
