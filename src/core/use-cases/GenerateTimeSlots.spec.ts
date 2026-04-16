import { DateTime } from "luxon";
import { FakeBarberRepository } from "../../tests/repositories/FakeBarberRepository";
import { FakeTimeRepository } from "../../tests/repositories/FakeTimeRepository";
import { BUSINESS_TIMEZONE } from "../utils/businessDate";
import { GenerateTimeSlots } from "./GenerateTimeSlots";

const businessDate = (plusDays: number) =>
  DateTime.now().setZone(BUSINESS_TIMEZONE).plus({ days: plusDays }).toISODate()!;

const localTime = (date: Date) => DateTime.fromJSDate(date).setZone(BUSINESS_TIMEZONE).toFormat("HH:mm");
const localDay = (date: Date) => DateTime.fromJSDate(date).setZone(BUSINESS_TIMEZONE).toISODate();

describe("GenerateTimeSlots", () => {
  let timeRepository: FakeTimeRepository;
  let barberRepository: FakeBarberRepository;
  let sut: GenerateTimeSlots;

  beforeEach(async () => {
    timeRepository = new FakeTimeRepository();
    barberRepository = new FakeBarberRepository();
    sut = new GenerateTimeSlots(timeRepository, barberRepository);
    await barberRepository.create({ userId: "barber-user-1", isAdmin: false });
  });

  it("deve criar uma jornada para cada dia selecionado explicitamente", async () => {
    const firstDate = businessDate(10);
    const secondDate = businessDate(20);

    const result = await sut.execute("barber-user-1", {
      startTime: "08:00",
      endTime: "14:00",
      startDate: firstDate,
      endDate: secondDate,
      selectedDates: [firstDate, secondDate],
    });

    expect(result.validation).toEqual({ isValid: true });
    expect(result.timeSlots).toHaveLength(2);
    expect(new Set(result.timeSlots.map((slot) => localDay(slot.startAt)))).toEqual(new Set([firstDate, secondDate]));
    expect(result.timeSlots.map((slot) => localTime(slot.startAt))).toEqual(["08:00", "08:00"]);
    expect(result.timeSlots.map((slot) => localTime(slot.endAt))).toEqual(["14:00", "14:00"]);
  });

  it("deve preservar intervalo dentro da jornada", async () => {
    const date = businessDate(12);

    const result = await sut.execute("barber-user-1", {
      startTime: "08:00",
      endTime: "18:00",
      intervalStart: "12:00",
      intervalDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.validation).toEqual({ isValid: true });
    expect(result.timeSlots).toHaveLength(1);
    expect(localTime(result.timeSlots[0].breakStartAt!)).toBe("12:00");
    expect(localTime(result.timeSlots[0].breakEndAt!)).toBe("12:30");
  });

  it("deve rejeitar intervalo fora do período de trabalho", async () => {
    const date = businessDate(12);

    const result = await sut.execute("barber-user-1", {
      startTime: "08:00",
      endTime: "18:00",
      intervalStart: "17:45",
      intervalDuration: 30,
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.timeSlots).toEqual([]);
    expect(result.validation).toEqual({
      isValid: false,
      error: "Horário de intervalo está fora do período de trabalho",
    });
  });

  it("deve impedir jornadas sobrepostas no mesmo dia", async () => {
    const date = businessDate(15);
    const day = DateTime.fromISO(date, { zone: BUSINESS_TIMEZONE });
    await timeRepository.create({
      barberId: "1",
      startAt: day.set({ hour: 8, minute: 0 }).toUTC().toJSDate(),
      endAt: day.set({ hour: 12, minute: 0 }).toUTC().toJSDate(),
    });

    const result = await sut.execute("barber-user-1", {
      startTime: "11:00",
      endTime: "14:00",
      startDate: date,
      endDate: date,
      selectedDates: [date],
    });

    expect(result.timeSlots).toEqual([]);
    expect(result.validation).toEqual({
      isValid: false,
      error: "Já existem jornadas cadastradas nesse período",
    });
  });

  it("deve excluir dias informados quando usar intervalo de datas", async () => {
    const startDate = businessDate(10);
    const endDate = businessDate(12);

    const result = await sut.execute("barber-user-1", {
      startTime: "08:00",
      endTime: "10:00",
      startDate,
      endDate,
      excludeDays: [DateTime.fromISO(startDate).weekday % 7],
    });

    expect(result.validation).toEqual({ isValid: true });
    expect(result.timeSlots.some((slot) => localDay(slot.startAt) === startDate)).toBe(false);
  });
});
