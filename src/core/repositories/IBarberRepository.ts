import { BarberDTO } from '../dtos/BarberDTO';
import { Barber } from '../entities/Barber';

export interface IBarbersRepository {
  findByUserId(userId: string): Promise<Barber | null>;
  create(data: { userId: string; isAdmin: boolean }): Promise<Barber>;
  dismiss(barberId: string): Promise<void>;
  getAllBarbers(): Promise<BarberDTO[]>;
}