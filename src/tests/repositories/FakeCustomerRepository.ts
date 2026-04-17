import { Customer } from "../../core/entities/Customer";
import { FindOrCreateCustomerDTO, ICustomerRepository, ListedCustomerDTO } from "../../core/repositories/ICustomerRepository";
import { assertCustomerName, assertWhatsapp } from "../../core/utils/customerInput";

export class FakeCustomerRepository implements ICustomerRepository {
  private customers: Customer[] = [];

  async findOrCreateByWhatsapp(data: FindOrCreateCustomerDTO): Promise<Customer> {
    const name = assertCustomerName(data.name);
    const whatsapp = assertWhatsapp(data.whatsapp);
    const existing = this.customers.find(customer => customer.whatsapp === whatsapp);
    if (existing) {
      existing.name = name;
      return existing;
    }
    const customer: Customer = {
      id: String(this.customers.length + 1),
      name,
      whatsapp,
      userId: null,
      blockedAt: null,
      blockedReason: null,
      blockedByBarberId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.push(customer);
    return customer;
  }

  async findOrCreateFromUser(userId: string): Promise<Customer> {
    const existing = this.customers.find(customer => customer.userId === userId);
    if (existing) return existing;
    const customer: Customer = {
      id: String(this.customers.length + 1),
      name: "Client Name",
      whatsapp: `1191234567${this.customers.length}`,
      userId,
      blockedAt: null,
      blockedReason: null,
      blockedByBarberId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.push(customer);
    return customer;
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.find((customer) => customer.id === id) ?? null;
  }

  async listCustomers(): Promise<ListedCustomerDTO[]> {
    return this.customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      whatsapp: customer.whatsapp,
      userId: customer.userId,
      email: null,
      noShowCount: 0,
      totalAppointments: 0,
      blockedAt: customer.blockedAt,
      blockedReason: customer.blockedReason,
      blockedByBarberId: customer.blockedByBarberId,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }

  async block(id: string, barberId: string, reason?: string): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) throw new Error("Cliente não encontrado");
    customer.blockedAt = new Date();
    customer.blockedByBarberId = barberId;
    customer.blockedReason = reason ?? null;
    return customer;
  }

  async unblock(id: string): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) throw new Error("Cliente não encontrado");
    customer.blockedAt = null;
    customer.blockedByBarberId = null;
    customer.blockedReason = null;
    return customer;
  }
}
