import { Time } from "../entities/Time";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class ToggleTimeSlot {
  constructor(
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository
  ) {}

  async execute(barberUserId: string, timeSlotId: string): Promise<Time> {
    const barber = await this.barberRepository.findByUserId(barberUserId);

    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const timeSlots = await this.timeRepository.findByBarberId(barber.id);
    const timeSlot = timeSlots?.find((t) => t.id === timeSlotId);

    if (!timeSlot) {
      throw new Error("Horário não encontrado");
    }

    if (timeSlot.barberId !== barber.id) {
      throw new Error("Você não tem permissão para modificar este horário");
    }

    const newDisponible = !timeSlot.disponible;
    await this.timeRepository.updateDisponible(timeSlotId, newDisponible);

    return new Time(
      timeSlot.id,
      timeSlot.barberId,
      timeSlot.date,
      newDisponible
    );
  }
}
