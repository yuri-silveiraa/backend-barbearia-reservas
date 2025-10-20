import { Balance } from "../entities/Balance";

export interface IBalanceRepository {
  create(data: Omit<Balance, "id" >): Promise<Balance>;
  findByBarberId(barberId: string): Promise<Balance | null>;
  deleteById(id: string): Promise<void>;
}