import { DateTime } from "luxon";
import { GenerateTimeSlotsDTO, TimeSlotDTO, TimeSlotValidationResult } from "../dtos/GenerateTimeSlotsDTO";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";
import {
  BUSINESS_TIMEZONE,
  addBusinessMonths,
  businessDateTimeToUtcDate,
  eachBusinessDateInRange,
  parseBusinessDate,
  todayBusinessDate,
} from "../utils/businessDate";

interface AvailabilityCandidate {
  startAt: Date;
  endAt: Date;
  breakStartAt?: Date | null;
  breakEndAt?: Date | null;
  day: DateTime;
}

export class GenerateTimeSlots {
  constructor(
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository
  ) {}

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private addMinutesToTime(time: string, minutesToAdd: number): string {
    const total = this.parseTime(time) + minutesToAdd;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  private validateConfig(config: GenerateTimeSlotsDTO): TimeSlotValidationResult {
    const startMinutes = this.parseTime(config.startTime);
    const endMinutes = this.parseTime(config.endTime);

    if (endMinutes <= startMinutes) {
      return { isValid: false, error: "Horário final deve ser maior que horário inicial" };
    }

    if (config.intervalStart && config.intervalDuration) {
      const breakStart = this.parseTime(config.intervalStart);
      const breakEnd = this.parseTime(this.addMinutesToTime(config.intervalStart, config.intervalDuration));

      if (breakStart < startMinutes || breakEnd > endMinutes || breakEnd <= breakStart) {
        return { isValid: false, error: "Horário de intervalo está fora do período de trabalho" };
      }
    }

    return { isValid: true };
  }

  private resolveSelectedDays(config: GenerateTimeSlotsDTO): DateTime[] | null {
    if (config.selectedDates && config.selectedDates.length > 0) {
      const uniqueDates = Array.from(new Set(config.selectedDates)).sort();
      const days = uniqueDates.map(parseBusinessDate);
      if (days.some((day) => !day)) return null;
      return days as DateTime[];
    }

    return eachBusinessDateInRange(config.startDate, config.endDate, config.excludeDays || []);
  }

  private hasConflict(candidate: AvailabilityCandidate, existingSlots: Array<{ startAt: Date; endAt: Date }>): boolean {
    const candidateStart = candidate.startAt.getTime();
    const candidateEnd = candidate.endAt.getTime();

    return existingSlots.some((slot) => {
      const existingStart = new Date(slot.startAt).getTime();
      const existingEnd = new Date(slot.endAt).getTime();
      return candidateStart < existingEnd && candidateEnd > existingStart;
    });
  }

  async execute(
    barberUserId: string,
    config: GenerateTimeSlotsDTO
  ): Promise<{ timeSlots: TimeSlotDTO[]; validation: TimeSlotValidationResult }> {
    const barber = await this.barberRepository.findByUserId(barberUserId);

    if (!barber || !barber.isActive) {
      throw new Error("Barbeiro não encontrado");
    }

    const startDate = parseBusinessDate(config.startDate);
    const endDate = parseBusinessDate(config.endDate);

    if (!startDate || !endDate || startDate > endDate) {
      throw new Error("Período inválido");
    }

    const days = this.resolveSelectedDays(config);
    if (!days || days.length === 0) {
      return { timeSlots: [], validation: { isValid: false, error: "Nenhum dia selecionado para gerar horários" } };
    }

    const today = todayBusinessDate();
    const twoMonthsLater = addBusinessMonths(today, 2);

    if (days.some((day) => day < today)) {
      throw new Error("Não é possível criar horários no passado");
    }

    if (days.some((day) => day > twoMonthsLater)) {
      throw new Error("Não é possível criar horários com mais de 2 meses de antecedência");
    }

    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return { timeSlots: [], validation };
    }

    const candidates: AvailabilityCandidate[] = [];
    for (const day of days) {
      const startAt = businessDateTimeToUtcDate(day, config.startTime);
      const endAt = businessDateTimeToUtcDate(day, config.endTime);
      if (!startAt || !endAt) continue;

      let breakStartAt: Date | null = null;
      let breakEndAt: Date | null = null;
      if (config.intervalStart && config.intervalDuration) {
        breakStartAt = businessDateTimeToUtcDate(day, config.intervalStart);
        breakEndAt = businessDateTimeToUtcDate(day, this.addMinutesToTime(config.intervalStart, config.intervalDuration));
      }

      candidates.push({ startAt, endAt, breakStartAt, breakEndAt, day });
    }

    for (const day of days) {
      const dayStart = day.startOf("day").setZone(BUSINESS_TIMEZONE).toUTC().toJSDate();
      const dayEnd = day.plus({ days: 1 }).startOf("day").setZone(BUSINESS_TIMEZONE).toUTC().toJSDate();
      const existingSlots = await this.timeRepository.findByBarberIdRange(barber.id, dayStart, dayEnd);
      const dayCandidates = candidates.filter((candidate) => candidate.day.hasSame(day, "day"));

      if (dayCandidates.some((candidate) => this.hasConflict(candidate, existingSlots))) {
        return { timeSlots: [], validation: { isValid: false, error: "Já existem jornadas cadastradas nesse período" } };
      }
    }

    const timeSlots: TimeSlotDTO[] = [];
    for (const candidate of candidates) {
      const availability = await this.timeRepository.create({
        barberId: barber.id,
        startAt: candidate.startAt,
        endAt: candidate.endAt,
        breakStartAt: candidate.breakStartAt,
        breakEndAt: candidate.breakEndAt,
      });

      timeSlots.push({
        id: availability.id,
        startAt: availability.startAt,
        endAt: availability.endAt,
        breakStartAt: availability.breakStartAt,
        breakEndAt: availability.breakEndAt,
      });
    }

    return { timeSlots, validation: { isValid: true } };
  }
}
