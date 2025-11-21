import { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  create(data: Omit<Payment, "id" | "createdAt">): Promise<Payment>;
  findByBalanceId(balanceId: string, date: Date): Promise<Payment[]>;
}