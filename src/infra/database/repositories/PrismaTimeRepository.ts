import { Time } from "../../../core/entities/Time";
import { CreateTimeRepositoryDTO, ITimeRepository } from "../../../core/repositories/ITimeRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaTimeRepository implements ITimeRepository {
  async create(data: CreateTimeRepositoryDTO): Promise<Time> {
    const time = await prisma.time.create({
      data: {
        date: data.date,
        barberId: data.barberId,
        duration: data.duration ?? 60,
      }
    });
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = await prisma.time.findMany({
      where: { 
        barberId,
        date: {
          gte: now,
        },
        NOT: {
          appointments: {
            some: {},
          },
        },
      },
      orderBy: {
        date: "asc",
      }
    });
    return times;
  }

  async findByBarberIdRange(barberId: string, startDate: Date, endDate: Date): Promise<Time[]> {
    return await prisma.time.findMany({
      where: {
        barberId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });
  }

  async findAvailableByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = await prisma.time.findMany({
      where: { 
        barberId,
        disponible: true,
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: "asc",
      }
    });
    return times;
  }

  async findById(timeId: string): Promise<Time | null> {
    const time = await prisma.time.findUnique({
      where: { id: timeId },
    });
    return time;
  }

  async updateDisponible(timeId: string, disponible: boolean): Promise<void> {
    await prisma.time.update({
      where: { id: timeId },
      data: { disponible },
    });
  }

  async deleteById(timeId: string): Promise<void> {
    await prisma.time.delete({
      where: { id: timeId },
    });
  }
}
