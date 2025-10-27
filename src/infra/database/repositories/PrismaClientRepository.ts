import { Client } from "../../../core/entities/Client";
import { IClientsRepository } from "../../../core/repositories/IClientRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaClientRepository implements IClientsRepository {
  async create(data: Client): Promise<Client> {
    const client = await prisma.client.create({
      data: {
        userId: data.userId,
        telephone: data.telephone,
      },
    });
    return client;
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { userId },
    });
  }
}