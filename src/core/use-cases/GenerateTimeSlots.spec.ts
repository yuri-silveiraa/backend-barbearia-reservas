import { DateTime } from "luxon";
import { GenerateTimeSlots } from "./GenerateTimeSlots";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { businessDateTimeToUtcDate, parseBusinessDate } from "../utils/businessDate";

const BUSINESS_TIMEZONE = "America/Sao_Paulo";

describe("GenerateTimeSlots", () => {
  let timeRepository: FakeTimeRepository;
  let barberRepository: FakeBarberRepository;
  let sut: GenerateTimeSlots;

  beforeEach(async () => {
    timeRepository = new FakeTimeRepository();
    barberRepository = new FakeBarberRepository();
    sut = new GenerateTimeSlots(timeRepository, barberRepository);

    await barberRepository.create({
      userId: "barbeiro-user-1",
      isAdmin: false,
    });
  });

  function formatDateOffset(days: number) {
    const date = DateTime.now().setZone(BUSINESS_TIMEZONE).startOf("day").plus({ days });
    return date.toISODate() as string;
  }

  function localTime(date: Date) {
    return DateTime.fromJSDate(date).setZone(BUSINESS_TIMEZONE).toFormat("HH:mm");
  }

  function localDay(date: Date) {
    return DateTime.fromJSDate(date).setZone(BUSINESS_TIMEZONE).toISODate();
  }

  it("deve retornar erro se horário final menor que inicial", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "21:00",
      endTime: "08:00",
      blockDuration: 30,
      startDate: date,
      endDate: date,
    });

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Horário final deve ser maior que horário inicial");
  });

  it("deve retornar erro se duração do bloco menor que 15 minutos", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "21:00",
      blockDuration: 10,
      startDate: date,
      endDate: date,
    });

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Duração do bloco deve estar entre 15 e 180 minutos");
  });

  it("deve retornar erro se duração do bloco maior que período total", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "10:00",
      blockDuration: 180,
      startDate: date,
      endDate: date,
    });

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Duração do bloco maior que o período total");
  });

  it("deve retornar warning e não criar horários quando sobrarem minutos sem confirmação", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "21:00",
      blockDuration: 45,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.timeSlots).toHaveLength(0);
    expect(result.validation.isValid).toBe(true);
    expect(result.validation.warning).toMatchObject({
      remainderMinutes: 15,
      lastBlockEnd: "20:45",
    });
  });

  it("deve criar blocos completos e deixar sobra livre quando confirmada", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "21:00",
      blockDuration: 45,
      startDate: date,
      endDate: date,
      selectedDates: [date],
      confirmRemainder: true,
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.validation.warning).toBeUndefined();
    expect(result.timeSlots).toHaveLength(17);
    expect(localTime(result.timeSlots[0].date)).toBe("08:00");
    expect(localTime(result.timeSlots[result.timeSlots.length - 1].date)).toBe("20:00");
  });

  it("deve gerar horários corretamente com configuração válida", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "10:00",
      blockDuration: 60,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots).toHaveLength(2);
    expect(result.timeSlots.map((slot) => localTime(slot.date))).toEqual(["08:00", "09:00"]);
  });

  it("deve criar horários somente nos dias selecionados e não no intervalo inteiro", async () => {
    const firstDate = formatDateOffset(1);
    const secondDate = formatDateOffset(10);

    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate: firstDate,
      endDate: secondDate,
      selectedDates: [firstDate, secondDate],
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots).toHaveLength(2);
    expect(new Set(result.timeSlots.map((slot) => localDay(slot.date)))).toEqual(new Set([firstDate, secondDate]));
  });

  it("deve manter compatibilidade gerando horários para intervalo quando selectedDates não for enviado", async () => {
    const startDate = formatDateOffset(1);
    const endDate = formatDateOffset(3);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate,
      endDate,
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots.length).toBeGreaterThanOrEqual(2);
  });

  it("deve gerar horários retomando exatamente no fim do intervalo", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "15:30",
      blockDuration: 60,
      intervalStart: "12:00",
      intervalDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots.map((slot) => localTime(slot.date))).toEqual([
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:30",
      "13:30",
      "14:30",
    ]);
  });

  it("não deve criar bloco atravessando o intervalo", async () => {
    const date = formatDateOffset(1);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "11:00",
      endTime: "14:00",
      blockDuration: 60,
      intervalStart: "11:30",
      intervalDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
      confirmRemainder: true,
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots.map((slot) => localTime(slot.date))).toEqual(["12:00", "13:00"]);
  });

  it("deve bloquear criação sobreposta no mesmo período", async () => {
    const date = formatDateOffset(1);
    await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "12:00",
      blockDuration: 60,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "12:00",
      blockDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.timeSlots).toHaveLength(0);
    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Já existem horários cadastrados nesse período");
  });

  it("deve bloquear sobreposição parcial", async () => {
    const date = formatDateOffset(1);
    const day = parseBusinessDate(date)!;
    const slotDate = businessDateTimeToUtcDate(day, "09:00")!;
    await timeRepository.create({ barberId: "1", date: slotDate, duration: 60 });

    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:30",
      endTime: "10:30",
      blockDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.error).toBe("Já existem horários cadastrados nesse período");
  });

  it("deve permitir criação no mesmo dia fora de período já cadastrado", async () => {
    const date = formatDateOffset(1);
    await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "12:00",
      blockDuration: 60,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    const result = await sut.execute("barbeiro-user-1", {
      startTime: "13:00",
      endTime: "17:00",
      blockDuration: 60,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots).toHaveLength(4);
  });

  it("deve excluir dias da semana especificados no modo de intervalo legado", async () => {
    const startDate = formatDateOffset(1);
    const endDate = formatDateOffset(7);
    const result = await sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate,
      endDate,
      excludeDays: [0, 6],
    });

    expect(result.validation.isValid).toBe(true);
    expect(result.timeSlots.every((slot) => {
      const weekday = DateTime.fromJSDate(slot.date).setZone(BUSINESS_TIMEZONE).weekday % 7;
      return weekday !== 0 && weekday !== 6;
    })).toBe(true);
  });

  it("deve retornar erro se data no passado", async () => {
    await expect(sut.execute("barbeiro-user-1", {
      startTime: "08:00",
      endTime: "09:00",
      blockDuration: 60,
      startDate: "2020-01-01",
      endDate: "2020-01-01",
      selectedDates: ["2020-01-01"],
    })).rejects.toThrow("Não é possível criar horários no passado");
  });
});
