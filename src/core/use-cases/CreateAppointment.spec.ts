import { CreateAppointment } from "./CreateAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { ClientScheduleLimitError } from "../errors/ClientScheduleLimitError";

describe("CreateAppointment", () => {
  const appointmentRepository = new FakeAppointmentRepository();
  const clientRepository = new FakeClientRepository();
  const timeRepository = new FakeTimeRepository();
  const sut = new CreateAppointment(appointmentRepository, clientRepository, timeRepository);

  it("deve criar um agendamento com sucesso", async () => {
    await clientRepository.create({
      userId: "user-client-1",
      telephone: "11999999999",
    });

    await timeRepository.create({
      barberId: "barber-1",
      date: new Date(),
    });

    const data = {
      clientId: "user-client-1",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "1",
    };

    const appointment = await sut.execute(data);

    expect(appointment).toHaveProperty("id");
    expect(appointment.clientId).toBe("1");
    expect(appointment.barberId).toBe(data.barberId);
    expect(appointment.serviceId).toBe(data.serviceId);
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve lançar erro se o cliente tiver mais de 1 agendamento na semana", async () => {
    await clientRepository.create({
      userId: "user-client-2",
      telephone: "11999999998",
    });

    await timeRepository.create({
      barberId: "barber-1",
      date: new Date(),
    });

    const data = {
      clientId: "user-client-2",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "2",
    };

    await sut.execute(data);

    await expect(sut.execute({
      clientId: "user-client-2",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "3",
    })).rejects.toThrow(ClientScheduleLimitError);
  });
});
