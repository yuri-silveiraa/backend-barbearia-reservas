import { Barber } from '../entities/Barber';

export interface IBarbersRepository {
  create(data: Omit<Barber, 'id' | 'createdAt' | 'isAdmin'>): Promise<Barber>;
  findByUserId(userId: string): Promise<Barber | null>;
}