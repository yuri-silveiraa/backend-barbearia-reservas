import { AttendAppointment } from "./AttendAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";
import { FakeBalanceRepository } from "../../tests/repositories/FakeBalanceRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

describe("AttendAppointment", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const barberRepository = new FakeBarberRepository();
  const serviceRepository = new FakeServiceRepository();
  const balanceRepository = new FakeBalanceRepository();

  const sut = new AttendAppointment(
    appointmentRepository,
    barberRepository,
    { create: jest.fn().mockResolvedValue(undefined) } as any,
    serviceRepository,
    balanceRepository
  );

  it("deve lançar erro se o barbeiro não existir", async () => {
    await expect(sut.execute({ id: "appointment-1", userId: "non-existent" }))
      .rejects.toThrow(NoAuthorizationError);
  });

  it("deve lançar erro se o barbeiro não for o dono do agendamento", async () => {
    const barber = await barberRepository.create({
      userId: "barber-user-1",
      isAdmin: false,
    });

    await balanceRepository.create({ barberId: barber.id });

    const service = await serviceRepository.create({
      name: "Corte",
      description: "Corte",
      price: 35,
    });

    const appointment = await appointmentRepository.create({
      barberId: "other-barber",
      clientId: "client-1",
      serviceId: service.id,
      timeId: "time-1",
    });

    await expect(sut.execute({ id: appointment.id, userId: "barber-user-1" }))
      .rejects.toThrow(NoAuthorizationError);
  });
});
