import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeCustomerRepository } from "../../tests/repositories/FakeCustomerRepository";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { ClientScheduleSpacingError } from "../errors/ClientScheduleSpacingError";
import { CreateManualAppointment } from "./CreateManualAppointment";

describe("CreateManualAppointment", () => {
  let appointmentRepository: FakeAppointmentRepository;
  let barberRepository: FakeBarberRepository;
  let customerRepository: FakeCustomerRepository;
  let timeRepository: FakeTimeRepository;
  let sut: CreateManualAppointment;

  beforeEach(() => {
    appointmentRepository = new FakeAppointmentRepository();
    barberRepository = new FakeBarberRepository();
    customerRepository = new FakeCustomerRepository();
    timeRepository = new FakeTimeRepository();
    sut = new CreateManualAppointment(appointmentRepository, barberRepository, customerRepository, timeRepository);
  });

  it("deve criar agendamento manual para cliente sem conta", async () => {
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const time = await timeRepository.create({ barberId: barber.id, date: new Date("2026-04-10T10:00:00.000Z") });

    const appointment = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "YURI PIRES",
      customerWhatsapp: "(11) 91234-5678",
      serviceId: "service-1",
      timeId: time.id,
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.clientId).toBeNull();
    expect(appointment.customerId).toBe("1");
    expect(appointment.barberId).toBe(barber.id);
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("deve reutilizar cliente pelo WhatsApp normalizado", async () => {
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const firstTime = await timeRepository.create({ barberId: barber.id, date: new Date("2026-04-01T10:00:00.000Z") });
    const secondTime = await timeRepository.create({ barberId: barber.id, date: new Date("2026-04-08T10:00:00.000Z") });

    const first = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "YURI PIRES",
      customerWhatsapp: "(11) 91234-5678",
      serviceId: "service-1",
      timeId: firstTime.id,
    });
    const second = await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      timeId: secondTime.id,
    });

    expect(second.customerId).toBe(first.customerId);
  });

  it("deve bloquear horário de outro barbeiro", async () => {
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const otherBarber = await barberRepository.create({ userId: "barber-user-2", isAdmin: false });
    const time = await timeRepository.create({ barberId: otherBarber.id, date: new Date("2026-04-10T10:00:00.000Z") });

    await expect(sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      timeId: time.id,
    })).rejects.toThrow("Horário não pertence ao barbeiro autenticado");
  });

  it("deve bloquear cliente com agendamento marcado a menos de 7 dias", async () => {
    const barber = await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
    const firstTime = await timeRepository.create({ barberId: barber.id, date: new Date("2026-04-01T10:00:00.000Z") });
    const secondTime = await timeRepository.create({ barberId: barber.id, date: new Date("2026-04-06T10:00:00.000Z") });

    await sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      timeId: firstTime.id,
    });

    await expect(sut.execute({
      barberUserId: "barber-user-1",
      customerName: "Yuri Pires",
      customerWhatsapp: "11912345678",
      serviceId: "service-1",
      timeId: secondTime.id,
    })).rejects.toThrow(ClientScheduleSpacingError);
  });
});
