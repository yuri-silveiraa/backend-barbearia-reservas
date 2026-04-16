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

export class ListAvailableTimeSlots {
  private readonly SLOT_GRANULARITY_MINUTES = 15;

  constructor(
    private timeRepository: ITimeRepository,
    private serviceRepository: IServiceRepository,
    private appointmentRepository: IAppointmentsRepository,
  ) {}

  private overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
  }

  private getTotalDuration(serviceIds: string[]): number {
    return 0;
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

      const chainPoints: DateTime[] = [availabilityStart];

      for (const appointment of sortedAppointments) {
        const appointmentEnd = DateTime.fromJSDate(appointment.endTime).setZone(BUSINESS_TIMEZONE);
        if (appointmentEnd > availabilityStart && appointmentEnd < availabilityEnd) {
          chainPoints.push(appointmentEnd);
        }
      }

      const uniqueChainPoints = [...new Set(chainPoints.map(cp => cp.toMillis()))]
        .map(ms => DateTime.fromMillis(ms, { zone: BUSINESS_TIMEZONE }))
        .sort((a, b) => a.toMillis() - b.toMillis());

      for (const chainPoint of uniqueChainPoints) {
        if (chainPoint < now) continue;

        let cursor = chainPoint;

        while (cursor.plus({ minutes: totalDuration }) <= availabilityEnd) {
          const slotStart = cursor.toUTC().toJSDate();
          const slotEnd = cursor.plus({ minutes: totalDuration }).toUTC().toJSDate();

          const crossesBreak = availability.breakStartAt && availability.breakEndAt
            ? this.overlaps(slotStart, slotEnd, availability.breakStartAt, availability.breakEndAt)
            : false;

          const conflictsAppointment = appointments.some((appointment) =>
            this.overlaps(slotStart, slotEnd, appointment.time, appointment.endTime)
          );

          if (slotStart >= now.toUTC().toJSDate() && !crossesBreak && !conflictsAppointment) {
            slots.push({
              id: slotStart.toISOString(),
              startAt: slotStart,
              endAt: slotEnd,
              date: slotStart,
            });
          }

          cursor = cursor.plus({ minutes: this.SLOT_GRANULARITY_MINUTES });
        }
      }
    }

    const uniqueSlots = slots.filter((slot, index, self) =>
      index === self.findIndex(s => s.startAt.getTime() === slot.startAt.getTime())
    );

    return uniqueSlots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }
}
