import { Payment } from "@prisma/client";
import { IPaymentRepository } from "../../../core/repositories/IPaymentRepository";
import { prisma } from "../prisma/prismaClient";

export class PrismaPaymentRepository implements IPaymentRepository {
  async create(data: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    return await prisma.payment.create({
      data,
    });
  }

  async findByBalanceId(balanceId: string, date: Date): Promise<Payment[]> {
    return await prisma.payment.findMany({
      where: {
        balanceId,
        createdAt: {
          gte: date,
        },
      },
    });
  }
}