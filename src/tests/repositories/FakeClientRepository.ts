import { Client } from "../../core/entities/Client";
import { IClientsRepository } from "../../core/repositories/IClientRepository";

export class FakeClientRepository implements IClientsRepository {
  private clients: Client[] = [];

  async findByUserId(userId: string): Promise<Client | null> {
    const client = this.clients.find(c => c.userId === userId);
    return client || null;
  }

  async create(data: { userId: string; telephone: string }): Promise<Client> {
    const client: Client = {
      id: String(this.clients.length + 1),
      userId: data.userId,
      telephone: data.telephone,
      createdAt: new Date(),
    };
    this.clients.push(client);
    return client;
  }

  async update(client: Client): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      this.clients[index] = client;
      return client;
    }
    throw new Error("Client not found");
  }
}
