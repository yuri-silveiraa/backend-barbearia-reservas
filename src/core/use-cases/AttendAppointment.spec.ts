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
  const paymentRepository = {
    create: jest.fn().mockResolvedValue(undefined),
  };

  const sut = new AttendAppointment(
    appointmentRepository,
    barberRepository,
    paymentRepository as any,
    serviceRepository,
    balanceRepository
  );

  beforeEach(() => {
    paymentRepository.create.mockClear();
  });

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

  it("deve atender agendamento marcado e criar pagamento", async () => {
    const barber = await barberRepository.create({
      userId: "barber-user-2",
      isAdmin: false,
    });

    await balanceRepository.create({ barberId: barber.id });

    const service = await serviceRepository.create({
      name: "Barba",
      description: "Barba completa",
      price: 50,
    });

    const appointment = await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-2",
      serviceId: service.id,
      timeId: "time-2",
    });

    await sut.execute({ id: appointment.id, userId: "barber-user-2" });

    const updated = await appointmentRepository.findById(appointment.id);
    expect(updated?.status).toBe("COMPLETED");
    expect(paymentRepository.create).toHaveBeenCalledTimes(1);
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50 })
    );
  });

  it("deve impedir atender agendamento que já foi concluído", async () => {
    const barber = await barberRepository.create({
      userId: "barber-user-3",
      isAdmin: false,
    });

    await balanceRepository.create({ barberId: barber.id });

    const service = await serviceRepository.create({
      name: "Corte + Barba",
      description: "Combo",
      price: 80,
    });

    const appointment = await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-3",
      serviceId: service.id,
      timeId: "time-3",
    });

    await sut.execute({ id: appointment.id, userId: "barber-user-3" });

    await expect(sut.execute({ id: appointment.id, userId: "barber-user-3" }))
      .rejects.toThrow("Somente agendamentos marcados podem ser atendidos");

    expect(paymentRepository.create).toHaveBeenCalledTimes(1);
  });
});
