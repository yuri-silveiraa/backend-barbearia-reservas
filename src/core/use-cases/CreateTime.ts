import { CreateTimeDTO } from "../dtos/CreateTimeDTO";
import { Time } from "../entities/Time";
import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class CreateTime {
  constructor(
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository
  ) {}

  async execute(data: CreateTimeDTO): Promise<Time> {
    const barber = await this.barberRepository.findByUserId(data.barberId);
    const time = await this.timeRepository.create({
      date: data.date,
      barberId: barber.id
    });
    return time;
  }
}