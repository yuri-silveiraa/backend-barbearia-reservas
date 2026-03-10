import { Time } from "../entities/Time";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class ListMyTimeSlots {
  constructor(
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository
  ) {}

  async execute(barberUserId: string): Promise<Time[]> {
    const barber = await this.barberRepository.findByUserId(barberUserId);

    if (!barber) {
      throw new Error("Barbeiro não encontrado");
    }

    const timeSlots = await this.timeRepository.findByBarberId(barber.id);

    return timeSlots || [];
  }
}
