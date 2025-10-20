import { Payment } from "../entities/Payment";

export interface IPaymentRepository {
  create(data: Omit<Payment, "id" >): Promise<Payment>;
  findByBalanceId(balanceId: string, date: Date): Promise<Payment[]>;
}