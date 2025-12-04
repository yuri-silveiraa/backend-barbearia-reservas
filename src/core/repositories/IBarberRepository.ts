import { BarberDTO } from '../dtos/BarberDTO';
import { Barber } from '../entities/Barber';

export interface IBarbersRepository {
  findByUserId(userId: string): Promise<Barber | null>;
  dismiss(barberId: string): Promise<void>;
  getAllBarbers(): Promise<BarberDTO[]>;
}