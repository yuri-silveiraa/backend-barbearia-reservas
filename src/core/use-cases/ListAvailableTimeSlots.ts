import { Time } from "../entities/Time";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class ListAvailableTimeSlots {
  constructor(private timeRepository: ITimeRepository) {}

  async execute(barberId: string): Promise<Time[]> {
    const times = await this.timeRepository.findAvailableByBarberId(barberId);
    return times || [];
  }
}
