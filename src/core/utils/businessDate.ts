import { DateTime } from "luxon";

export const BUSINESS_TIMEZONE = "America/Sao_Paulo";

export function parseBusinessDate(value: string): DateTime | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = DateTime.fromISO(value, { zone: BUSINESS_TIMEZONE });
  return parsed.isValid ? parsed : null;
}

export function businessDayBoundary(value: string, boundary: "start" | "end"): Date | null {
  const parsed = parseBusinessDate(value);
  if (!parsed) {
    return null;
  }

  const localBoundary = boundary === "start"
    ? parsed.startOf("day")
    : parsed.endOf("day");

  return localBoundary.toUTC().toJSDate();
}

export function businessDayRange(value: string): { start: Date; end: Date } | null {
  const start = businessDayBoundary(value, "start");
  const end = businessDayBoundary(value, "end");

  if (!start || !end) {
    return null;
  }

  return { start, end };
}

export function todayBusinessDayRange(reference: Date = new Date()): { start: Date; end: Date } {
  const now = DateTime.fromJSDate(reference).setZone(BUSINESS_TIMEZONE);

  return {
    start: now.startOf("day").toUTC().toJSDate(),
    end: now.endOf("day").toUTC().toJSDate(),
  };
}

export function todayBusinessDate(reference: Date = new Date()): DateTime {
  return DateTime.fromJSDate(reference).setZone(BUSINESS_TIMEZONE).startOf("day");
}

export function addBusinessMonths(date: DateTime, months: number): DateTime {
  return date.plus({ months }).startOf("day");
}

export function eachBusinessDateInRange(startValue: string, endValue: string, excludeDays: number[] = []): DateTime[] | null {
  const start = parseBusinessDate(startValue);
  const end = parseBusinessDate(endValue);

  if (!start || !end || start > end) {
    return null;
  }

  const days: DateTime[] = [];
  let current = start.startOf("day");
  const finalDay = end.startOf("day");

  while (current <= finalDay) {
    if (!excludeDays.includes(current.weekday % 7)) {
      days.push(current);
    }
    current = current.plus({ days: 1 });
  }

  return days;
}

export function businessDateTimeToUtcDate(date: DateTime, time: string): Date | null {
  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  const localDateTime = date.set({ hour, minute, second: 0, millisecond: 0 });
  return localDateTime.isValid ? localDateTime.toUTC().toJSDate() : null;
}

export function formatBusinessDateTime(value: Date): string {
  return DateTime.fromJSDate(value)
    .setZone(BUSINESS_TIMEZONE)
    .toFormat("dd/MM/yyyy, HH:mm");
}
