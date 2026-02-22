import { ListClientAppointments } from "./ListClientAppointments";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { ClientNotFoundError } from "../errors/ClientNotFoundError";

describe("ListClientAppointments", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const clientRepository = new FakeClientRepository();
  const sut = new ListClientAppointments(appointmentRepository, clientRepository);

  it("deve lançar erro se o cliente não existir", async () => {
    await expect(sut.execute("non-existent")).rejects.toThrow(ClientNotFoundError);
  });

  it("deve retornar lista de agendamentos do cliente", async () => {
    const client = await clientRepository.create({
      userId: "user-client-1",
      telephone: "11999999999",
    });

    await appointmentRepository.create({
      barberId: "barber-1",
      clientId: client.id,
      serviceId: "service-1",
      timeId: "time-1",
    });

    const appointments = await sut.execute("user-client-1");

    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.length).toBe(1);
  });

  it("deve retornar lista vazia se não houver agendamentos", async () => {
    const client = await clientRepository.create({
      userId: "user-client-2",
      telephone: "11999999998",
    });

    const appointments = await sut.execute("user-client-2");

    expect(appointments).toEqual([]);
  });
});
