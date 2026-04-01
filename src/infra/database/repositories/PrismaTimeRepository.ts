import { Time } from "@prisma/client";
import { ITimeRepository } from "../../../core/repositories/ITimeRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaTimeRepository implements ITimeRepository {
  async create(data: Omit<Time, "id" | "disponible">): Promise<Time> {
    const time = await prisma.time.create({
      data: {
        date: data.date,
        barberId: data.barberId
      }
    });
    return time;
  }

  async findByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = await prisma.time.findMany({
      where: { 
        barberId: barberId,
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

  async findAvailableByBarberId(barberId: string): Promise<Time[] | null> {
    const now = new Date();
    const times = await prisma.time.findMany({
      where: { 
        barberId: barberId,
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
      data: { disponible: disponible },
    });
  }

  async deleteById(timeId: string): Promise<void> {
    await prisma.time.delete({
      where: { id: timeId },
    });
  }
}
