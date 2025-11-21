import { Balance } from "../../../core/entities/Balance";
import { IBalanceRepository } from "../../../core/repositories/IBalanceRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaBalanceRepository implements IBalanceRepository {
  async findByBarberId(barberId: string): Promise<Balance| null> {
    return await prisma.balance.findUnique({
      where: { barberId },
    });
    
  }

  async deleteById(id: string): Promise<void> {
    await prisma.balance.delete({
      where: { id },
    });
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    await prisma.balance.update({
      where: { id },
      data: { balance: amount , atualizedAt: new Date() },
    });
  }
}