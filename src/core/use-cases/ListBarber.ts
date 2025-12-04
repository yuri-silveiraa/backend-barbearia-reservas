import { IBarbersRepository } from "../repositories/IBarberRepository";
import { BarberDTO } from "../dtos/BarberDTO";

export class ListBarber {
  constructor(private barberRepository: IBarbersRepository) {}
  async execute(): Promise<BarberDTO[]> {
    const barbers = await this.barberRepository.getAllBarbers();
    return barbers;
  }
}