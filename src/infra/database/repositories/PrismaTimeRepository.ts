import { Time } from "../../../core/entities/Time";
import { CreateTimeRepositoryDTO, ITimeRepository } from "../../../core/repositories/ITimeRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaTimeRepository implements ITimeRepository {
  async create(data: CreateTimeRepositoryDTO): Promise<Time> {
    const time = await prisma.time.create({
      data: {
        startAt: data.startAt,
        endAt: data.endAt,
        breakStartAt: data.breakStartAt ?? null,
        breakEndAt: data.breakEndAt ?? null,
        barberId: data.barberId,
      }
    });
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = await prisma.time.findMany({
      where: { 
        barberId,
        endAt: {
          gte: now,
        },
      },
      orderBy: {
        startAt: "asc",
      }
    });
    return times;
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]> {
    return await prisma.time.findMany({
      where: {
        barberId,
        startAt: { lt: endDate },
        endAt: { gt: startDate },
      },
      orderBy: {
        startAt: "asc",
      },
    });
  }

  async findById(timeId: string): Promise<Time | null> {
    const time = await prisma.time.findUnique({
      where: { id: timeId },
    });
    return time;
  }

  async deleteById(timeId: string): Promise<void> {
    await prisma.time.delete({
      where: { id: timeId },
    });
  }
}
