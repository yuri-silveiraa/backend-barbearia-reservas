import { DateTime } from "luxon";
import { FakeAppointmentRepository } from "../../tests/repositories/FakeAppointmentRepository";
import { FakeServiceRepository } from "../../tests/repositories/FakeServiceRepository";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { BUSINESS_TIMEZONE } from "../utils/businessDate";
import { ListAvailableTimeSlots } from "./ListAvailableTimeSlots";

function localDateTime(date: string, time: string): Date {
  return DateTime.fromISO(`${date}T${time}`, { zone: BUSINESS_TIMEZONE }).toUTC().toJSDate();
}

function localTime(date: Date): string {
  return DateTime.fromJSDate(date).setZone(BUSINESS_TIMEZONE).toFormat("HH:mm");
}

describe("ListAvailableTimeSlots", () => {
  let timeRepository: FakeTimeRepository;
  let serviceRepository: FakeServiceRepository;
  let appointmentRepository: FakeAppointmentRepository;
  let sut: ListAvailableTimeSlots;

  beforeEach(() => {
    timeRepository = new FakeTimeRepository();
    serviceRepository = new FakeServiceRepository();
    appointmentRepository = new FakeAppointmentRepository();
    sut = new ListAvailableTimeSlots(timeRepository, serviceRepository, appointmentRepository);
  });

  it("deve usar a menor duração dos serviços ativos do barbeiro como passo", async () => {
    const date = "2030-04-10";
    const barberId = "barber-1";
    await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    const selectedService = await serviceRepository.create({ barberId, name: "Barba", price: 30, durationMinutes: 45 });
    await serviceRepository.create({ barberId, name: "Completo", price: 90, durationMinutes: 90 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "10:00"),
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual(["08:00", "08:30", "09:00"]);
  });

  it("deve gerar passos de 15 minutos quando esse for o menor serviço ativo", async () => {
    const date = "2030-04-11";
    const barberId = "barber-1";
    const selectedService = await serviceRepository.create({ barberId, name: "Retoque", price: 20, durationMinutes: 15 });
    await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    await serviceRepository.create({ barberId, name: "Barba", price: 30, durationMinutes: 45 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "09:00"),
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual(["08:00", "08:15", "08:30", "08:45"]);
  });

  it("deve reiniciar a grade no fim de agendamento desalinhado com o passo", async () => {
    const date = "2030-04-12";
    const barberId = "barber-1";
    const selectedService = await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "10:00"),
    });
    await appointmentRepository.create({
      barberId,
      serviceId: selectedService.id,
      serviceIds: [selectedService.id],
      customerId: "customer-1",
      startAt: localDateTime(date, "08:15"),
      totalDuration: 30,
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toContain("08:45");
  });

  it("deve usar encaixe especial antes de agendamento e remover o slot normal conflitante", async () => {
    const date = "2030-04-13";
    const barberId = "barber-1";
    const selectedService = await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "11:00"),
    });
    await appointmentRepository.create({
      barberId,
      serviceId: selectedService.id,
      serviceIds: [selectedService.id],
      customerId: "customer-1",
      startAt: localDateTime(date, "10:10"),
      totalDuration: 30,
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });
    const times = slots.map((slot) => localTime(slot.startAt));

    expect(times).toContain("09:40");
    expect(times).not.toContain("09:30");
  });

  it("deve incluir chain point no fim do intervalo do barbeiro", async () => {
    const date = "2030-04-14";
    const barberId = "barber-1";
    const selectedService = await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "10:30"),
      breakStartAt: localDateTime(date, "09:10"),
      breakEndAt: localDateTime(date, "09:25"),
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toContain("09:25");
  });

  it("deve retornar erro claro quando o barbeiro não possui serviços ativos", async () => {
    const date = "2030-04-15";
    const barberId = "barber-1";
    const service = await serviceRepository.create({ barberId, name: "Inativo", price: 40, durationMinutes: 30, active: false });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "10:00"),
    });

    await expect(sut.execute({ barberId, serviceIds: [service.id], startDate: date, endDate: date }))
      .rejects.toThrow("Barbeiro não possui serviços ativos");
  });

  it("deve encaixar antes de bloqueio sem propagar passos quebrados para depois do intervalo", async () => {
    const date = "2030-04-16";
    const barberId = "barber-1";
    await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    const selectedService = await serviceRepository.create({ barberId, name: "Barba Completa", price: 60, durationMinutes: 45 });
    await serviceRepository.create({ barberId, name: "Completo", price: 100, durationMinutes: 90 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "15:00"),
      breakStartAt: localDateTime(date, "12:00"),
      breakEndAt: localDateTime(date, "12:30"),
    });
    await appointmentRepository.create({
      barberId,
      serviceId: selectedService.id,
      serviceIds: [selectedService.id],
      customerId: "customer-1",
      startAt: localDateTime(date, "11:00"),
      totalDuration: 45,
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual([
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:15",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
    ]);
  });

  it("não deve criar encaixe especial no fim do expediente", async () => {
    const date = "2030-04-17";
    const barberId = "barber-1";
    await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    const selectedService = await serviceRepository.create({ barberId, name: "Barba", price: 30, durationMinutes: 45 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "12:30"),
      endAt: localDateTime(date, "15:00"),
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual(["12:30", "13:00", "13:30", "14:00"]);
    expect(slots.map((slot) => localTime(slot.startAt))).not.toContain("14:15");
  });

  it("deve ignorar serviços inativos e de outro barbeiro ao calcular o menor passo", async () => {
    const date = "2030-04-18";
    const barberId = "barber-1";
    await serviceRepository.create({ barberId, name: "Retoque inativo", price: 20, durationMinutes: 15, active: false });
    await serviceRepository.create({ barberId: "barber-2", name: "Retoque outro barbeiro", price: 20, durationMinutes: 15 });
    await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    const selectedService = await serviceRepository.create({ barberId, name: "Barba", price: 30, durationMinutes: 45 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "10:00"),
    });

    const slots = await sut.execute({ barberId, serviceIds: [selectedService.id], startDate: date, endDate: date });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual(["08:00", "08:30", "09:00"]);
  });

  it("deve usar soma das durações dos serviços selecionados e manter o menor passo ativo", async () => {
    const date = "2030-04-19";
    const barberId = "barber-1";
    const firstService = await serviceRepository.create({ barberId, name: "Corte", price: 40, durationMinutes: 30 });
    const secondService = await serviceRepository.create({ barberId, name: "Barba", price: 30, durationMinutes: 45 });
    await serviceRepository.create({ barberId, name: "Completo", price: 90, durationMinutes: 90 });
    await timeRepository.create({
      barberId,
      startAt: localDateTime(date, "08:00"),
      endAt: localDateTime(date, "11:00"),
    });

    const slots = await sut.execute({
      barberId,
      serviceIds: [firstService.id, secondService.id],
      startDate: date,
      endDate: date,
    });

    expect(slots.map((slot) => localTime(slot.startAt))).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });
});
