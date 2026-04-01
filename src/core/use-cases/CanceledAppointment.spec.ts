import { CanceledAppointment } from "./CanceledAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

describe("CanceledAppointment", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const clientRepository = new FakeClientRepository();
  const barberRepository = new FakeBarberRepository();
  const timeRepository = new FakeTimeRepository();
  const sut = new CanceledAppointment(appointmentRepository, clientRepository, timeRepository, barberRepository);

  it("deve lançar erro se o cliente não for o dono do agendamento", async () => {
    const client = await clientRepository.create({
      userId: "client-user-1",
    });

    const otherClient = await clientRepository.create({
      userId: "client-user-2",
    });

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: otherClient.id,
      serviceId: "service-1",
      timeId: "time-1",
    });

    await expect(sut.execute("client-user-1", appointment.id))
      .rejects.toThrow(NoAuthorizationError);
  });

  it("deve cancelar um agendamento com sucesso", async () => {
    const client = await clientRepository.create({
      userId: "client-user-3",
    });

    const time = await timeRepository.create({
      barberId: "barber-1",
      date: new Date(Date.now() + 60 * 60 * 1000),
    });
    await timeRepository.updateDisponible(time.id, false);

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      timeId: time.id,
    });

    await sut.execute("client-user-3", appointment.id);

    const canceled = await appointmentRepository.findById(appointment.id);
    const availableTimes = await timeRepository.findByBarberId("barber-1");
    expect(canceled?.status).toBe("CANCELED");
    expect(availableTimes?.some((availableTime) => availableTime.id === time.id)).toBe(true);
  });

  it("deve permitir barbeiro cancelar agendamento do próprio barbeiro", async () => {
    const barber = await barberRepository.create({
      userId: "barber-user-1",
      isAdmin: false,
    });

    const time = await timeRepository.create({
      barberId: barber.id,
      date: new Date(Date.now() + 60 * 60 * 1000),
    });
    await timeRepository.updateDisponible(time.id, false);

    const appointment = await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-1",
      serviceId: "service-1",
      timeId: time.id,
    });

    await sut.execute("barber-user-1", appointment.id);

    const canceled = await appointmentRepository.findById(appointment.id);
    const availableTimes = await timeRepository.findByBarberId(barber.id);
    expect(canceled?.status).toBe("CANCELED");
    expect(availableTimes?.some((availableTime) => availableTime.id === time.id)).toBe(true);
  });

  it("não deve cancelar agendamento já concluído", async () => {
    const client = await clientRepository.create({
      userId: "client-user-4",
    });

    const time = await timeRepository.create({
      barberId: "barber-1",
      date: new Date(Date.now() + 60 * 60 * 1000),
    });
    await timeRepository.updateDisponible(time.id, false);

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      timeId: time.id,
    });

    await appointmentRepository.attend(appointment.id);

    await expect(sut.execute("client-user-4", appointment.id))
      .rejects.toThrow("Agendamentos concluídos não podem ser cancelados");
  });
});
