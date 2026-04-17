import { DateTime } from "luxon";
import { AppError } from "../errors/AppError";
import { IAppointmentsRepository } from "../repositories/IAppointmentRepository";
import { IServiceRepository } from "../repositories/IServiceRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";
import { BUSINESS_TIMEZONE } from "../utils/businessDate";

export interface AvailableTimeSlot {
  id: string;
  startAt: Date;
  endAt: Date;
  date: Date;
}

export interface ListAvailableTimeSlotsInput {
  barberId: string;
  serviceIds: string[];
  startDate?: string;
  endDate?: string;
}

type FreeWindow = {
  start: DateTime;
  end: DateTime;
  endsBeforeBlock: boolean;
};

type Block = {
  start: DateTime;
  end: DateTime;
};

export class ListAvailableTimeSlots {
  constructor(
    private timeRepository: ITimeRepository,
    private serviceRepository: IServiceRepository,
    private appointmentRepository: IAppointmentsRepository,
  ) {}

  private overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
  }

  private dateTimeOverlaps(startA: DateTime, endA: DateTime, startB: DateTime, endB: DateTime): boolean {
    return startA < endB && endA > startB;
  }

  private getMinActiveServiceDuration(services: Array<{ durationMinutes: number }>): number {
    const durations = services
      .map((service) => service.durationMinutes)
      .filter((duration) => Number.isFinite(duration) && duration >= 15);

    if (durations.length === 0) {
      throw new AppError("Barbeiro não possui serviços ativos", 400);
    }

    return Math.min(...durations);
  }

  private buildFreeWindows(availabilityStart: DateTime, availabilityEnd: DateTime, blocks: Block[]): FreeWindow[] {
    const freeWindows: FreeWindow[] = [];
    const sortedBlocks = blocks
      .filter((block) => this.dateTimeOverlaps(block.start, block.end, availabilityStart, availabilityEnd))
      .map((block) => ({
        start: block.start < availabilityStart ? availabilityStart : block.start,
        end: block.end > availabilityEnd ? availabilityEnd : block.end,
      }))
      .filter((block) => block.end > block.start)
      .sort((a, b) => a.start.toMillis() - b.start.toMillis());

    let cursor = availabilityStart;

    for (const block of sortedBlocks) {
      if (block.start > cursor) {
        freeWindows.push({ start: cursor, end: block.start, endsBeforeBlock: true });
      }

      if (block.end > cursor) {
        cursor = block.end;
      }
    }

    if (cursor < availabilityEnd) {
      freeWindows.push({ start: cursor, end: availabilityEnd, endsBeforeBlock: false });
    }

    return freeWindows;
  }

  private createSlot(start: DateTime, totalDuration: number): AvailableTimeSlot {
    const slotStart = start.toUTC().toJSDate();
    return {
      id: slotStart.toISOString(),
      startAt: slotStart,
      endAt: start.plus({ minutes: totalDuration }).toUTC().toJSDate(),
      date: slotStart,
    };
  }

  private slotOverlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return this.overlaps(startA, endA, startB, endB);
  }

  private addWindowSlots(
    slots: AvailableTimeSlot[],
    freeWindow: FreeWindow,
    totalDuration: number,
    slotStepMinutes: number,
    now: DateTime,
  ) {
    const windowSlots: AvailableTimeSlot[] = [];
    let cursor = freeWindow.start;

    while (cursor.plus({ minutes: totalDuration }) <= freeWindow.end) {
      if (cursor >= now) {
        windowSlots.push(this.createSlot(cursor, totalDuration));
      }
      cursor = cursor.plus({ minutes: slotStepMinutes });
    }

    const specialStart = freeWindow.end.minus({ minutes: totalDuration });
    const canUseSpecialFit =
      freeWindow.endsBeforeBlock &&
      specialStart >= freeWindow.start &&
      specialStart >= now &&
      !windowSlots.some((slot) => slot.startAt.getTime() === specialStart.toUTC().toJSDate().getTime());

    if (canUseSpecialFit) {
      const specialSlot = this.createSlot(specialStart, totalDuration);
      const nonOverlappingSlots = windowSlots.filter((slot) =>
        !this.slotOverlaps(slot.startAt, slot.endAt, specialSlot.startAt, specialSlot.endAt)
      );
      slots.push(...nonOverlappingSlots, specialSlot);
      return;
    }

    slots.push(...windowSlots);
  }

  async execute(input: ListAvailableTimeSlotsInput): Promise<AvailableTimeSlot[]> {
    const { serviceIds } = input;

    if (!serviceIds || serviceIds.length === 0) {
      throw new AppError("Pelo menos um serviço deve ser selecionado", 400);
    }

    const services = await this.serviceRepository.findByIds(serviceIds);
    if (services.length === 0) {
      throw new AppError("Serviços não encontrados", 404);
    }

    const activeBarberServices = await this.serviceRepository.findAll(input.barberId);
    const slotStepMinutes = this.getMinActiveServiceDuration(activeBarberServices);

    for (const service of services) {
      if (!service.active) {
        throw new AppError(`Serviço "${service.name}" não está ativo`, 400);
      }
      if (service.barberId !== input.barberId) {
        throw new AppError(`Serviço "${service.name}" não pertence ao barbeiro`, 400);
      }
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);

    const now = DateTime.now().setZone(BUSINESS_TIMEZONE);
    const rangeStart = input.startDate
      ? DateTime.fromISO(input.startDate, { zone: BUSINESS_TIMEZONE }).startOf("day")
      : now.startOf("day");
    const rangeEnd = input.endDate
      ? DateTime.fromISO(input.endDate, { zone: BUSINESS_TIMEZONE }).plus({ days: 1 }).startOf("day")
      : rangeStart.plus({ days: 60 });

    if (!rangeStart.isValid || !rangeEnd.isValid || rangeEnd <= rangeStart) {
      throw new AppError("Período inválido", 400);
    }

    const startUtc = rangeStart.toUTC().toJSDate();
    const endUtc = rangeEnd.toUTC().toJSDate();
    const availabilities = await this.timeRepository.findByBarberIdRange(input.barberId, startUtc, endUtc);
    const appointments = await this.appointmentRepository.findScheduledByBarberIdRange(input.barberId, startUtc, endUtc);
    const slots: AvailableTimeSlot[] = [];

    const sortedAppointments = [...appointments].sort(
      (a, b) => a.time.getTime() - b.time.getTime()
    );

    for (const availability of availabilities) {
      const availabilityStart = DateTime.fromJSDate(availability.startAt).setZone(BUSINESS_TIMEZONE);
      const availabilityEnd = DateTime.fromJSDate(availability.endAt).setZone(BUSINESS_TIMEZONE);

      const blocks: Block[] = [];
      if (availability.breakStartAt && availability.breakEndAt) {
        blocks.push({
          start: DateTime.fromJSDate(availability.breakStartAt).setZone(BUSINESS_TIMEZONE),
          end: DateTime.fromJSDate(availability.breakEndAt).setZone(BUSINESS_TIMEZONE),
        });
      }

      for (const appointment of sortedAppointments) {
        blocks.push({
          start: DateTime.fromJSDate(appointment.time).setZone(BUSINESS_TIMEZONE),
          end: DateTime.fromJSDate(appointment.endTime).setZone(BUSINESS_TIMEZONE),
        });
      }

      const freeWindows = this.buildFreeWindows(availabilityStart, availabilityEnd, blocks);

      for (const freeWindow of freeWindows) {
        if (freeWindow.end <= now) {
          continue;
        }

        this.addWindowSlots(slots, freeWindow, totalDuration, slotStepMinutes, now);
      }
    }

    const uniqueSlots = slots.filter((slot, index, self) =>
      index === self.findIndex(s => s.startAt.getTime() === slot.startAt.getTime())
    );

    return uniqueSlots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }
}
