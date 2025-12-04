import { BarberDTO } from "../../../core/dtos/BarberDTO";
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

  async getAllBarbers(): Promise<BarberDTO[]> {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      include: {
        user: { select: { name: true }},
      }
    });
    
    const barber = barbers.map((b) => ({
      id: b.id,
      userId: b.userId,
      name: b.user.name,
      isAdmin: b.isAdmin,
      isActive: b.isActive,
      createdAt: b.createdAt,
    }));

    return barber;
  }
}