import { Customer } from "../../core/entities/Customer";
import { FindOrCreateCustomerDTO, ICustomerRepository } from "../../core/repositories/ICustomerRepository";
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.push(customer);
    return customer;
  }
}
