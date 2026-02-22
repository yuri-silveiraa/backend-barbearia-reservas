import { Balance } from "../../core/entities/Balance";
import { IBalanceRepository } from "../../core/repositories/IBalanceRepository";

export class FakeBalanceRepository implements IBalanceRepository {
  private balances: Balance[] = [];

  async findByBarberId(barberId: string): Promise<Balance | null> {
    const balance = this.balances.find(b => b.barberId === barberId);
    return balance || null;
  }

  async create(data: { barberId: string }): Promise<Balance> {
    const balance: Balance = {
      id: String(this.balances.length + 1),
      barberId: data.barberId,
      balance: 0,
      atualizedAt: new Date(),
    };
    this.balances.push(balance);
    return balance;
  }

  async updateBalance(id: string, amount: number): Promise<void> {
    const balance = this.balances.find(b => b.id === id);
    if (balance) {
      balance.balance = amount;
      balance.atualizedAt = new Date();
    }
  }
}
