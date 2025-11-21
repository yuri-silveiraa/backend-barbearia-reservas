import { Barber } from "../../../core/entities/Barber";
import { IBarbersRepository } from "../../../core/repositories/IBarberRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaBarberRepository implements IBarbersRepository {
  async create(data: Barber): Promise<Barber> {
    const barber = await prisma.barber.create({
    data: {
      userId: data.userId,
      isAdmin: data.isAdmin ?? false,
      Balance: {
        create: {
          balance: 0,
        },
      },
    },
    include: { Balance: true },
  });

  return barber;
  }

  async findByUserId(userId: string): Promise<Barber | null> {
    return await prisma.barber.findUnique({
      where: { userId },
    });
  }
}