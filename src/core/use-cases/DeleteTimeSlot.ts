import { IBarbersRepository } from "../repositories/IBarberRepository";
import { ITimeRepository } from "../repositories/ITimeRepository";

export class DeleteTimeSlot {
  constructor(
    private timeRepository: ITimeRepository,
    private barberRepository: IBarbersRepository
  ) {}

  async execute(barberUserId: string, timeSlotId: string): Promise<void> {
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
      throw new Error("Você não tem permissão para excluir este horário");
    }

    await this.timeRepository.deleteById(timeSlotId);
  }
}
