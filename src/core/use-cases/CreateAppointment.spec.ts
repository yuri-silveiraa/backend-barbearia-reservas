import { CreateAppointment } from "./CreateAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";

describe("CreateAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let clientRepository: FakeClientRepository;
  let timeRepository: FakeTimeRepository;
  let customerRepository: FakeCustomerRepository;
  let sut: CreateAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    clientRepository = new FakeClientRepository();
    timeRepository = new FakeTimeRepository();
    customerRepository = new FakeCustomerRepository();
    sut = new CreateAppointment(appointmentRepository, clientRepository, timeRepository, customerRepository);
  });

  it("deve criar um agendamento com sucesso", async () => {
    await clientRepository.create({
      userId: "user-client-1",
    });

    const data = {
      clientId: "user-client-1",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "",
    };

    const time = await timeRepository.create({
      barberId: data.barberId,
      date: new Date("2026-04-10T10:00:00.000Z"),
    });
    data.timeId = time.id;

    const appointment = await sut.execute(data);

    expect(appointment).toHaveProperty("id");
    expect(appointment.clientId).toBe("1");
    expect(appointment.barberId).toBe(data.barberId);
    expect(appointment.serviceId).toBe(data.serviceId);
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve permitir agendamentos com pelo menos 7 dias de diferença", async () => {
    await clientRepository.create({
      userId: "user-client-2",
    });

    const baseData = {
      clientId: "user-client-2",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "",
    };

    const firstTime = await timeRepository.create({
      barberId: baseData.barberId,
      date: new Date("2026-04-01T10:00:00.000Z"),
    });
    await sut.execute({ ...baseData, timeId: firstTime.id });

    const secondTime = await timeRepository.create({
      barberId: baseData.barberId,
      date: new Date("2026-04-08T10:00:00.000Z"),
    });
    const created = await sut.execute({ ...baseData, timeId: secondTime.id });
    expect(created).toHaveProperty("id");
  });

  it("deve bloquear agendamentos com menos de 7 dias de diferença", async () => {
    await clientRepository.create({
      userId: "user-client-3",
    });

    const baseData = {
      clientId: "user-client-3",
      barberId: "barber-1",
      serviceId: "service-1",
      timeId: "",
    };

    const firstTime = await timeRepository.create({
      barberId: baseData.barberId,
      date: new Date("2026-04-01T10:00:00.000Z"),
    });
    await sut.execute({ ...baseData, timeId: firstTime.id });

    const secondTime = await timeRepository.create({
      barberId: baseData.barberId,
      date: new Date("2026-04-06T10:00:00.000Z"),
    });
    await expect(
      sut.execute({ ...baseData, timeId: secondTime.id })
    ).rejects.toThrow(ClientScheduleSpacingError);
  });
});
