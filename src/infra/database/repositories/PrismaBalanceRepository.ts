import { Balance } from "../../../core/entities/Balance";
import { IBalanceRepository } from "../../../core/repositories/IBalanceRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaBalanceRepository implements IBalanceRepository {
  async findByBarberId(barberId: string): Promise<Balance| null> {
    return await prisma.balance.findUnique({
      where: { barberId },
    });
    
  }

  async create(data: { barberId: string }): Promise<Balance> {
    return await prisma.balance.create({
      data: {
        barberId: data.barberId,
        balance: 0,
      },
    });
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    await prisma.balance.update({
      where: { id },
      data: { balance: amount , atualizedAt: new Date() },
    });
  }
}