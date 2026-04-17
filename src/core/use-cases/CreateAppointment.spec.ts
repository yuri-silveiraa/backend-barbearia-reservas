import { CreateAppointment } from "./CreateAppointment";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeClientRepository } from "../../tests/repositories/FakeClientRepository";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";

describe("CreateAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let clientRepository: FakeClientRepository;
  let customerRepository: FakeCustomerRepository;
  let serviceRepository: FakeServiceRepository;
  let sut: CreateAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    clientRepository = new FakeClientRepository();
    customerRepository = new FakeCustomerRepository();
    serviceRepository = new FakeServiceRepository();
    sut = new CreateAppointment(appointmentRepository, clientRepository, customerRepository, serviceRepository);
  });

  it("deve criar um agendamento com sucesso usando início do atendimento", async () => {
    await clientRepository.create({ userId: "user-client-1" });
    const service = await serviceRepository.create({ barberId: "barber-1", name: "Corte", price: 40, durationMinutes: 30 });

    const appointment = await sut.execute({
      clientId: "user-client-1",
      barberId: "barber-1",
      serviceIds: [service.id],
      startAt: "2026-04-10T10:00:00.000Z",
    });

    expect(appointment).toHaveProperty("id");
    expect(appointment.clientId).toBe("1");
    expect(appointment.barberId).toBe("barber-1");
    expect(appointment.serviceId).toBe(service.id);
    expect(appointment.scheduledAt).toEqual(new Date("2026-04-10T10:00:00.000Z"));
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve permitir agendamentos com pelo menos 5 dias de diferença", async () => {
    await clientRepository.create({ userId: "user-client-2" });
    const service = await serviceRepository.create({ barberId: "barber-1", name: "Corte", price: 40, durationMinutes: 30 });

    const baseData = {
      clientId: "user-client-2",
      barberId: "barber-1",
      serviceIds: [service.id],
    };

    await sut.execute({ ...baseData, startAt: "2026-04-01T10:00:00.000Z" });
    const created = await sut.execute({ ...baseData, startAt: "2026-04-06T10:00:00.000Z" });

    expect(created).toHaveProperty("id");
  });

  it("deve bloquear agendamentos com menos de 5 dias de diferença", async () => {
    await clientRepository.create({ userId: "user-client-3" });
    const service = await serviceRepository.create({ barberId: "barber-1", name: "Corte", price: 40, durationMinutes: 30 });

    const baseData = {
      clientId: "user-client-3",
      barberId: "barber-1",
      serviceIds: [service.id],
    };

    await sut.execute({ ...baseData, startAt: "2026-04-01T10:00:00.000Z" });

    await expect(
      sut.execute({ ...baseData, startAt: "2026-04-05T10:00:00.000Z" })
    ).rejects.toThrow(ClientScheduleSpacingError);
  });

  it("deve bloquear criação para cliente bloqueado manualmente", async () => {
    await clientRepository.create({ userId: "user-client-4" });
    const customer = await customerRepository.findOrCreateFromUser("user-client-4");
    await customerRepository.block(customer.id, "barber-admin-1", "Duas faltas sem aviso");
    const service = await serviceRepository.create({ barberId: "barber-1", name: "Corte", price: 40, durationMinutes: 30 });

    await expect(sut.execute({
      clientId: "user-client-4",
      barberId: "barber-1",
      serviceIds: [service.id],
      startAt: "2026-04-10T10:00:00.000Z",
    })).rejects.toThrow("Cliente bloqueado para novos agendamentos");
  });
});
