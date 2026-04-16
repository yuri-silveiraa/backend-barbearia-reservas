import { CreateAppointment } from "./CreateAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";

describe("CreateAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let clientRepository: FakeClientRepository;
  let customerRepository: FakeCustomerRepository;
  let sut: CreateAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    clientRepository = new FakeClientRepository();
    customerRepository = new FakeCustomerRepository();
    sut = new CreateAppointment(appointmentRepository, clientRepository, customerRepository);
  });

  it("deve criar um agendamento com sucesso usando início do atendimento", async () => {
    await clientRepository.create({ userId: "user-client-1" });

    const appointment = await sut.execute({
      clientId: "user-client-1",
      barberId: "barber-1",
      serviceId: "service-1",
      startAt: "2026-04-10T10:00:00.000Z",
    });

    expect(appointment).toHaveProperty("id");
    expect(appointment.clientId).toBe("1");
    expect(appointment.barberId).toBe("barber-1");
    expect(appointment.serviceId).toBe("service-1");
    expect(appointment.scheduledAt).toEqual(new Date("2026-04-10T10:00:00.000Z"));
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve permitir agendamentos com pelo menos 7 dias de diferença", async () => {
    await clientRepository.create({ userId: "user-client-2" });

    const baseData = {
      clientId: "user-client-2",
      barberId: "barber-1",
      serviceId: "service-1",
    };

    await sut.execute({ ...baseData, startAt: "2026-04-01T10:00:00.000Z" });
    const created = await sut.execute({ ...baseData, startAt: "2026-04-08T10:00:00.000Z" });

    expect(created).toHaveProperty("id");
  });

  it("deve bloquear agendamentos com menos de 7 dias de diferença", async () => {
    await clientRepository.create({ userId: "user-client-3" });

    const baseData = {
      clientId: "user-client-3",
      barberId: "barber-1",
      serviceId: "service-1",
    };

    await sut.execute({ ...baseData, startAt: "2026-04-01T10:00:00.000Z" });

    await expect(
      sut.execute({ ...baseData, startAt: "2026-04-06T10:00:00.000Z" })
    ).rejects.toThrow(ClientScheduleSpacingError);
  });
});
