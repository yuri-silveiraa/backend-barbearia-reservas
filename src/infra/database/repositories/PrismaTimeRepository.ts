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
    const times = await prisma.time.findMany({
      where: { 
        barberId: barberId,
        disponible: true
       },
      orderBy: {
        date: "asc",
      }
    });
    return times;
  }

  async updateDisponible(timeId: string, disponible: boolean): Promise<void> {
    await prisma.time.update({
      where: { id: timeId },
      data: { disponible },
    });
  }
}