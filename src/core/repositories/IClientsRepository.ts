import { Client } from '../entities/Client';


export interface IClientsRepository {
create(data: Omit<Client, 'id' | 'createdAt'>): Promise<Client>;
findByUserId(userId: string): Promise<Client | null>;
}