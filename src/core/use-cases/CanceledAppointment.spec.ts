import { CanceledAppointment } from "./CanceledAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

describe("CanceledAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let clientRepository: FakeClientRepository;
  let barberRepository: FakeBarberRepository;
  let sut: CanceledAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    clientRepository = new FakeClientRepository();
    barberRepository = new FakeBarberRepository();
    sut = new CanceledAppointment(appointmentRepository, clientRepository, barberRepository);
  });

  it("deve lançar erro se o cliente não for o dono do agendamento", async () => {
    await clientRepository.create({ userId: "client-user-1" });
    const otherClient = await clientRepository.create({ userId: "client-user-2" });

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: otherClient.id,
      serviceId: "service-1",
      startAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await expect(sut.execute("client-user-1", appointment.id)).rejects.toThrow(NoAuthorizationError);
  });

  it("deve cancelar um agendamento com sucesso", async () => {
    const client = await clientRepository.create({ userId: "client-user-3" });

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      startAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sut.execute("client-user-3", appointment.id);

    const canceled = await appointmentRepository.findById(appointment.id);
    expect(canceled?.status).toBe("CANCELED");
    expect(canceled?.canceledBy).toBe("CLIENT");
  });

  it("deve permitir barbeiro cancelar agendamento do próprio barbeiro", async () => {
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });

    const appointment = await appointmentRepository.create({
      barberId: barber.id,
      clientId: "client-1",
      serviceId: "service-1",
      startAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sut.execute("barber-user-1", appointment.id);

    const canceled = await appointmentRepository.findById(appointment.id);
    expect(canceled?.status).toBe("CANCELED");
    expect(canceled?.canceledBy).toBe("BARBER");
  });

  it("não deve cancelar agendamento já concluído", async () => {
    const client = await clientRepository.create({ userId: "client-user-4" });

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      startAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    await appointmentRepository.attend(appointment.id);

    await expect(sut.execute("client-user-4", appointment.id)).rejects.toThrow("Agendamentos concluídos não podem ser cancelados");
  });
});
