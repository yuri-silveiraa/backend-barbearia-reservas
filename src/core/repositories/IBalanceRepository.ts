import { Balance } from "../entities/Balance";

export interface IBalanceRepository {
  findByBarberId(barberId: string): Promise<Balance | null>;
  create(data: { barberId: string }): Promise<Balance>;
  updateBalance(id: string, amount: number): Promise<void>;
}