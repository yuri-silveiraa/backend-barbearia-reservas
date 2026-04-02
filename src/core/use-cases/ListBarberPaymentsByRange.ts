import { IBarbersRepository } from "../repositories/IBarberRepository";
import { IBalanceRepository } from "../repositories/IBalanceRepository";
import { IPaymentRepository } from "../repositories/IPaymentRepository";
import { NoAuthorizationError } from "../errors/NoAuthorizationError";

export class ListBarberPaymentsByRange {
  constructor(
    private barberRepository: IBarbersRepository,
    private balanceRepository: IBalanceRepository,
    private paymentRepository: IPaymentRepository,
  ) {}

  async execute(userId: string, startDate: Date, endDate: Date) {
    const barber = await this.barberRepository.findByUserId(userId);
    if (!barber) {
      throw new NoAuthorizationError();
    }

    const balance = await this.balanceRepository.findByBarberId(barber.id);
    if (!balance) {
      return { balance: 0, payments: [] as { id: string; amount: number; createdAt: Date }[] };
    }

    const payments = await this.paymentRepository.findByBalanceIdRange(
      balance.id,
      startDate,
      endDate
    );

    return { balance: balance.balance, payments };
  }
}
