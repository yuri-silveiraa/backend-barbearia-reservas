import { Time } from "../entities/Time";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class ListTimeDisponible {
  constructor(private timeRepository: ITimeRepository) {}

  async execute(barberId: string): Promise<Time[]> {
    const times = await this.timeRepository.findByBarberId(barberId);
    return times || [];
  }
}
