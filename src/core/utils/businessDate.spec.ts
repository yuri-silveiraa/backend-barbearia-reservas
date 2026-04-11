import {
  businessDateTimeToUtcDate,
  businessDayBoundary,
  parseBusinessDate,
  todayBusinessDayRange,
} from "./businessDate";

describe("businessDate", () => {
  it("deve converter um dia de São Paulo para o range UTC correto", () => {
    expect(businessDayBoundary("2026-04-10", "start")).toEqual(new Date("2026-04-10T03:00:00.000Z"));
    expect(businessDayBoundary("2026-04-10", "end")).toEqual(new Date("2026-04-11T02:59:59.999Z"));
  });

  it("deve manter o dia local de São Paulo mesmo quando em UTC já é o dia seguinte", () => {
    const range = todayBusinessDayRange(new Date("2026-04-11T00:30:00.000Z"));

    expect(range.start).toEqual(new Date("2026-04-10T03:00:00.000Z"));
    expect(range.end).toEqual(new Date("2026-04-11T02:59:59.999Z"));
  });

  it("deve converter horário local do barbeiro para UTC ao criar slots", () => {
    const day = parseBusinessDate("2026-04-10");

    expect(day).not.toBeNull();
    expect(businessDateTimeToUtcDate(day!, "08:00")).toEqual(new Date("2026-04-10T11:00:00.000Z"));
  });
});
