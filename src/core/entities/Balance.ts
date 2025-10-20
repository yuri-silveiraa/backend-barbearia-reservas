import { Payment } from "./Payment";

export class Balance {
  constructor(
    public readonly id: string,
    public readonly barberId: string,
    public balance: number = 0,
    public readonly createdAt: Date = new Date(),
    public payments: Payment[] = []
  ) {}

  addPayment(payment: Payment) {
    this.payments.push(payment);
    this.balance += payment.amount;
  }

  getTotalPayments(): number {
    return this.payments.reduce((sum, p) => sum + p.amount, 0);
  }

  resetBalance() {
    this.balance = 0;
    this.payments = [];
  }
}
