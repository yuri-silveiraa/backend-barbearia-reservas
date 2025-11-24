import { Client } from '../entities/Client';

export interface IClientsRepository {
  findByUserId(userId: string): Promise<Client | null>;
  update(client: Client): Promise<Client>;
}