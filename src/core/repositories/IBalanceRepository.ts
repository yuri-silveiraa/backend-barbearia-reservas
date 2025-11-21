import { Balance } from "../entities/Balance";

export interface IBalanceRepository {
  findByBarberId(barberId: string): Promise<Balance | null>;
  updateBalance(id: string, amount: number): Promise<void>;
}