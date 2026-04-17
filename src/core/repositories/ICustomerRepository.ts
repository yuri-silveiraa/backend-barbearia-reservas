import { Customer } from "../entities/Customer";

export interface FindOrCreateCustomerDTO {
  name: string;
  whatsapp: string;
}

export interface ListedCustomerDTO {
  id: string;
  name: string;
  whatsapp: string;
  userId?: string | null;
  email?: string | null;
  noShowCount: number;
  totalAppointments: number;
  blockedAt?: Date | null;
  blockedReason?: string | null;
  blockedByBarberId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerRepository {
  findOrCreateByWhatsapp(data: FindOrCreateCustomerDTO): Promise<Customer>;
  findOrCreateFromUser(userId: string): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  listCustomers(): Promise<ListedCustomerDTO[]>;
  block(id: string, barberId: string, reason?: string): Promise<Customer>;
  unblock(id: string): Promise<Customer>;
}
