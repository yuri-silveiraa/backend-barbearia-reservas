import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { CreateManualAppointment } from "./CreateManualAppointment";

describe("CreateManualAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let barberRepository: FakeBarberRepository;
  let customerRepository: FakeCustomerRepository;
  let sut: CreateManualAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    barberRepository = new FakeBarberRepository();
    customerRepository = new FakeCustomerRepository();
    sut = new CreateManualAppointment(appointmentRepository, barberRepository, customerRepository);
  });

  it("deve criar agendamento manual para cliente sem conta", async () => {
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });

    const appointment = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "YURI PIRES",
      customerWhatsapp: "(11) 91234-5678",
      serviceId: "service-1",
      startAt: "2026-04-10T10:00:00.000Z",
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.clientId).toBeNull();
    expect(appointment.customerId).toBe("1");
    expect(appointment.barberId).toBe(barber.id);
    expect(appointment.scheduledAt).toEqual(new Date("2026-04-10T10:00:00.000Z"));
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve reutilizar cliente pelo WhatsApp normalizado", async () => {
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });

    const first = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "YURI PIRES",
      customerWhatsapp: "(11) 91234-5678",
      serviceId: "service-1",
      startAt: "2026-04-01T10:00:00.000Z",
    });
    const second = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      startAt: "2026-04-06T10:00:00.000Z",
    });

    expect(second.customerId).toBe(first.customerId);
  });

  it("deve bloquear cliente com agendamento marcado a menos de 5 dias", async () => {
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });

    await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      startAt: "2026-04-01T10:00:00.000Z",
    });

    await expect(sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      startAt: "2026-04-05T10:00:00.000Z",
    })).rejects.toThrow(ClientScheduleSpacingError);
  });

  it("deve bloquear agendamento manual para WhatsApp bloqueado", async () => {
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const customer = await customerRepository.findOrCreateByWhatsapp({
      name: "Yuri Pires",
      whatsapp: "11912345678",
    });
    await customerRepository.block(customer.id, "barber-admin-1", "Faltas sem aviso");

    await expect(sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      startAt: "2026-04-10T10:00:00.000Z",
    })).rejects.toThrow("Cliente bloqueado para novos agendamentos");
  });
});
