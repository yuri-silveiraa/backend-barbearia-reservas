import { Barber } from "../../../core/entities/Barber";
import { IBarbersRepository } from "../../../core/repositories/IBarberRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaBarberRepository implements IBarbersRepository {
  async findByUserId(userId: string): Promise<Barber | null> {
    return await prisma.barber.findUnique({
      where: { userId },
    });
  }

  async dismiss(barberId: string): Promise<void> {
    await prisma.barber.update({
      where: { id: barberId },
      data: {
        isActive: false,
      },
    });
  }
}