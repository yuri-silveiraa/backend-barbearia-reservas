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

interface TimeBlock {
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
}

interface TimeSegment {
  start: number;
  end: number;
}

interface CandidateSlot {
  date: Date;
  endDate: Date;
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

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  private addMinutesToTime(time: string, minutesToAdd: number): number {
    return this.parseTime(time) + minutesToAdd;
  }

  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private getIntervalWindow(config: GenerateTimeSlotsDTO): { start: number; end: number } | null {
    if (!config.intervalStart) {
      return null;
    }

    const duration = Number(config.intervalDuration);
    if (!Number.isFinite(duration) || duration <= 0) {
      return null;
    }

    const startMinutes = this.parseTime(config.intervalStart);
    const endMinutes = this.addMinutesToTime(config.intervalStart, duration);

    return { start: startMinutes, end: endMinutes };
  }

  private getWorkSegments(config: GenerateTimeSlotsDTO): TimeSegment[] {
    const startMinutes = this.parseTime(config.startTime);
    const endMinutes = this.parseTime(config.endTime);
    const intervalWindow = this.getIntervalWindow(config);

    if (!intervalWindow) {
      return [{ start: startMinutes, end: endMinutes }];
    }

    return [
      { start: startMinutes, end: intervalWindow.start },
      { start: intervalWindow.end, end: endMinutes },
    ].filter((segment) => segment.end > segment.start);
  }

  private getRemainderInfo(config: GenerateTimeSlotsDTO): { remainderMinutes: number; lastBlockEnd: string } | null {
    let remainderMinutes = 0;
    let lastBlockEnd = config.startTime;

    for (const segment of this.getWorkSegments(config)) {
      const segmentMinutes = segment.end - segment.start;
      const fullBlocks = Math.floor(segmentMinutes / config.blockDuration);
      const remainder = segmentMinutes % config.blockDuration;

      remainderMinutes += remainder;
      if (fullBlocks > 0) {
        lastBlockEnd = this.formatTime(segment.start + fullBlocks * config.blockDuration);
      }
    }

    if (remainderMinutes === 0) {
      return null;
    }

    return { remainderMinutes, lastBlockEnd };
  }

  private validateConfig(config: GenerateTimeSlotsDTO): TimeSlotValidationResult {
    const startMinutes = this.parseTime(config.startTime);
    const endMinutes = this.parseTime(config.endTime);

    if (endMinutes <= startMinutes) {
      return {
        isValid: false,
        error: "Horário final deve ser maior que horário inicial",
      };
    }

    if (config.blockDuration < 15 || config.blockDuration > 180) {
      return {
        isValid: false,
        error: "Duração do bloco deve estar entre 15 e 180 minutos",
      };
    }

    const totalMinutes = endMinutes - startMinutes;

    if (config.blockDuration > totalMinutes) {
      return {
        isValid: false,
        error: "Duração do bloco maior que o período total",
      };
    }

    const intervalWindow = this.getIntervalWindow(config);
    if (intervalWindow) {
      if (intervalWindow.start < startMinutes || intervalWindow.end > endMinutes) {
        return {
          isValid: false,
          error: "Horário de intervalo está fora do período de trabalho",
        };
      }

      const hasAnySegmentWithBlock = this.getWorkSegments(config).some(
        (segment) => segment.end - segment.start >= config.blockDuration
      );

      if (!hasAnySegmentWithBlock) {
        return {
          isValid: false,
          error: "Duração do bloco não permite criar horários fora do intervalo de almoço",
        };
      }
    }

    const remainderInfo = this.getRemainderInfo(config);
    if (remainderInfo) {
      return {
        isValid: true,
        warning: {
          message: `O bloco de ${config.blockDuration} minutos não cobre perfeitamente o período de ${config.startTime} às ${config.endTime}. Sobrarão ${remainderInfo.remainderMinutes} minutos e a geração terminará às ${remainderInfo.lastBlockEnd}.`,
          ...remainderInfo,
        },
      };
    }

    return { isValid: true };
  }

  private generateTimeBlocks(config: GenerateTimeSlotsDTO): TimeBlock[] {
    const blocks: TimeBlock[] = [];

    for (const segment of this.getWorkSegments(config)) {
      let currentTime = segment.start;

      while (currentTime + config.blockDuration <= segment.end) {
        const endMinutes = currentTime + config.blockDuration;
        blocks.push({
          start: this.formatTime(currentTime),
          end: this.formatTime(endMinutes),
          startMinutes: currentTime,
          endMinutes,
        });
        currentTime = endMinutes;
      }
    }

    return blocks;
  }

  private resolveSelectedDays(config: GenerateTimeSlotsDTO): DateTime[] | null {
    if (config.selectedDates && config.selectedDates.length > 0) {
      const uniqueDates = Array.from(new Set(config.selectedDates)).sort();
      const days = uniqueDates.map(parseBusinessDate);
      if (days.some((day) => !day)) {
        return null;
      }
      return days as DateTime[];
    }

    return eachBusinessDateInRange(config.startDate, config.endDate, config.excludeDays || []);
  }

  private hasConflict(candidate: CandidateSlot, existingSlots: Array<{ date: Date; duration?: number }>): boolean {
    const candidateStart = candidate.date.getTime();
    const candidateEnd = candidate.endDate.getTime();

    return existingSlots.some((slot) => {
      const existingStart = new Date(slot.date).getTime();
      const existingEnd = this.addMinutes(new Date(slot.date), slot.duration ?? 60).getTime();
      return candidateStart < existingEnd && candidateEnd > existingStart;
    });
  }

  async execute(
    barberUserId: string,
    config: GenerateTimeSlotsDTO
  ): Promise<{ timeSlots: TimeSlotDTO[]; validation: TimeSlotValidationResult }> {
    const barber = await this.barberRepository.findByUserId(barberUserId);

    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const startDate = parseBusinessDate(config.startDate);
    const endDate = parseBusinessDate(config.endDate);

    if (!startDate || !endDate || startDate > endDate) {
      throw new Error("Período inválido");
    }

    const days = this.resolveSelectedDays(config);

    if (!days || days.length === 0) {
      return {
        timeSlots: [],
        validation: {
          isValid: false,
          error: "Nenhum dia selecionado para gerar horários",
        },
      };
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

    if (validation.warning && !config.confirmRemainder) {
      return { timeSlots: [], validation };
    }

    const blocks = this.generateTimeBlocks(config);

    if (blocks.length === 0) {
      return {
        timeSlots: [],
        validation: {
          isValid: false,
          error: "Não foi possível gerar horários com a configuração informada",
        },
      };
    }

    const candidates: CandidateSlot[] = [];

    for (const day of days) {
      for (const block of blocks) {
        const slotDate = businessDateTimeToUtcDate(day, block.start);
        const slotEndDate = businessDateTimeToUtcDate(day, block.end);
        if (!slotDate || !slotEndDate) {
          continue;
        }
        candidates.push({ date: slotDate, endDate: slotEndDate, day });
      }
    }

    for (const day of days) {
      const dayStart = day.startOf("day").setZone(BUSINESS_TIMEZONE).toUTC().toJSDate();
      const dayEnd = day.plus({ days: 1 }).startOf("day").setZone(BUSINESS_TIMEZONE).toUTC().toJSDate();
      const existingSlots = await this.timeRepository.findByBarberIdRange(barber.id, dayStart, dayEnd);
      const dayCandidates = candidates.filter((candidate) => candidate.day.hasSame(day, "day"));

      if (dayCandidates.some((candidate) => this.hasConflict(candidate, existingSlots))) {
        return {
          timeSlots: [],
          validation: {
            isValid: false,
            error: "Já existem horários cadastrados nesse período",
          },
        };
      }
    }

    const timeSlots: TimeSlotDTO[] = [];

    for (const candidate of candidates) {
      const newSlot = await this.timeRepository.create({
        barberId: barber.id,
        date: candidate.date,
        duration: config.blockDuration,
      });

      timeSlots.push({
        id: newSlot.id,
        date: newSlot.date,
        disponible: newSlot.disponible,
      });
    }

    return { timeSlots, validation: { isValid: true } };
  }
}
