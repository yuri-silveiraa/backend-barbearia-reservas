import { Client } from "../../../core/entities/Client";
import { IClientsRepository } from "../../../core/repositories/IClientRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaClientRepository implements IClientsRepository {
  async findByUserId(userId: string): Promise<Client | null> {
    return await prisma.client.findUnique({
      where: { userId },
    });
  }

  async update(client: Client): Promise<Client> {
    return await prisma.client.update({
      where: { id: client.id },
      data: {
        telephone: client.telephone,
      },
    });
  }
}