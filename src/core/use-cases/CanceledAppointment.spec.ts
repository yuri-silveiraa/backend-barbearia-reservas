import { CanceledAppointment } from "./CanceledAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

describe("CanceledAppointment", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const clientRepository = new FakeClientRepository();
  const sut = new CanceledAppointment(appointmentRepository, clientRepository);

  it("deve lançar erro se o cliente não for o dono do agendamento", async () => {
    const client = await clientRepository.create({
      userId: "client-user-1",
      telephone: "11999999999",
    });

    const otherClient = await clientRepository.create({
      userId: "client-user-2",
      telephone: "11999999998",
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
      telephone: "11999999997",
    });

    const appointment = await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      timeId: "time-2",
    });

    await sut.execute("client-user-3", appointment.id);

    const canceled = await appointmentRepository.findById(appointment.id);
    expect(canceled?.status).toBe("CANCELED");
  });
});
