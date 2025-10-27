import { Barber } from "../../../core/entities/Barber";
import { IBarbersRepository } from "../../../core/repositories/IBarberRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaBarberRepository implements IBarbersRepository {
  async create(data: Barber): Promise<Barber> {
    const barber = await prisma.barber.create({
      data: {
        userId: data.userId,
      },
    });
    return barber;
  }

  async findByUserId(userId: string): Promise<Barber | null> {
    return await prisma.barber.findUnique({
      where: { userId },
    });
  }
}