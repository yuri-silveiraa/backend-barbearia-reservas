import { GenerateTimeSlotsDTO, TimeSlotValidationResult, TimeSlotDTO } from "../dtos/GenerateTimeSlotsDTO";
import { Time } from "../entities/Time";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

interface TimeBlock {
  start: string;
  end: string;
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

  private getDaysInRange(startDate: string, endDate: string, excludeDays: number[]): Date[] {
    const days: Date[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (!excludeDays.includes(dayOfWeek)) {
        days.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
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

    const remainder = totalMinutes % config.blockDuration;

    if (remainder > 0) {
      const option1Start = config.startTime;
      const option1End = this.formatTime(this.addMinutesToTime(config.startTime, config.blockDuration));
      
      const option2Start = this.formatTime(this.addMinutesToTime(config.endTime, -config.blockDuration));
      const option2End = config.endTime;

      return {
        isValid: true,
        warning: {
          message: `O bloco de ${config.blockDuration} minutos não cobre perfeitamente o período de ${config.startTime} às ${config.endTime}. Sobrarão ${remainder} minutos.`,
          options: [
            { start: option1Start, end: option1End },
            { start: option2Start, end: option2End },
          ],
        },
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

      if (intervalWindow.start < endMinutes && intervalWindow.end > startMinutes) {
        const intervalOverlaps = intervalWindow.start < endMinutes && intervalWindow.end > startMinutes;
        if (intervalOverlaps) {
          if (config.blockDuration > intervalWindow.start - startMinutes && 
              config.blockDuration > endMinutes - intervalWindow.end) {
            return {
              isValid: false,
              error: "Duração do bloco não permite criar horários fora do intervalo de almoço",
            };
          }
        }
      }
    }

    return { isValid: true };
  }

  private generateTimeBlocks(
    config: GenerateTimeSlotsDTO,
    selectedOption?: { start: string; end: string }
  ): TimeBlock[] {
    const blocks: TimeBlock[] = [];
    
    let periodStart = config.startTime;
    let periodEnd = config.endTime;

    if (selectedOption) {
      periodStart = selectedOption.start;
      periodEnd = selectedOption.end;
    }

    let currentTime = this.parseTime(periodStart);
    const endTime = this.parseTime(periodEnd);
    const intervalWindow = this.getIntervalWindow(config);

    while (currentTime + config.blockDuration <= endTime) {
      const blockStart = this.formatTime(currentTime);
      const blockEnd = this.formatTime(currentTime + config.blockDuration);

      if (intervalWindow) {
        const blockEndMinutes = currentTime + config.blockDuration;

        const overlapsInterval = 
          currentTime < intervalWindow.end && blockEndMinutes > intervalWindow.start;

        if (!overlapsInterval) {
          blocks.push({ start: blockStart, end: blockEnd });
        }
      } else {
        blocks.push({ start: blockStart, end: blockEnd });
      }

      currentTime += config.blockDuration;
    }

    return blocks;
  }

  async execute(
    barberUserId: string,
    config: GenerateTimeSlotsDTO,
    selectedOption?: { start: string; end: string }
  ): Promise<{ timeSlots: TimeSlotDTO[]; validation: TimeSlotValidationResult }> {
    const barber = await this.barberRepository.findByUserId(barberUserId);

    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      throw new Error("Não é possível criar horários no passado");
    }

    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

    if (endDate > twoMonthsLater) {
      throw new Error("Não é possível criar horários com mais de 2 meses de antecedência");
    }

    const validation = this.validateConfig(config);

    if (!validation.isValid && !selectedOption) {
      return { timeSlots: [], validation };
    }

    const blocks = this.generateTimeBlocks(config, selectedOption);

    if (blocks.length === 0) {
      return {
        timeSlots: [],
        validation: {
          isValid: false,
          error: "Não foi possível gerar horários com a configuração informada",
        },
      };
    }

    const days = this.getDaysInRange(config.startDate, config.endDate, config.excludeDays || []);

    if (days.length === 0) {
      return {
        timeSlots: [],
        validation: {
          isValid: false,
          error: "Nenhum dia selecionado para gerar horários",
        },
      };
    }

    const timeSlots: TimeSlotDTO[] = [];

    for (const day of days) {
      for (const block of blocks) {
        const [startHour, startMin] = block.start.split(":").map(Number);

        const slotDate = new Date(day);
        slotDate.setHours(startHour, startMin, 0, 0);

        const existingSlots = await this.timeRepository.findByBarberId(barber.id);
        const conflict = existingSlots?.some(
          (s) => new Date(s.date).getTime() === slotDate.getTime()
        );

        if (!conflict) {
          const newSlot = await this.timeRepository.create({
            barberId: barber.id,
            date: slotDate,
          });

          timeSlots.push({
            id: newSlot.id,
            date: newSlot.date,
            disponible: newSlot.disponible,
          });
        }
      }
    }

    return { timeSlots, validation: { isValid: true } };
  }
}
