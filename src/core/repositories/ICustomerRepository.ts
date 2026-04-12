import { Customer } from "../entities/Customer";

export interface FindOrCreateCustomerDTO {
  name: string;
  whatsapp: string;
}

export interface ICustomerRepository {
  findOrCreateByWhatsapp(data: FindOrCreateCustomerDTO): Promise<Customer>;
  findOrCreateFromUser(userId: string): Promise<Customer>;
}
